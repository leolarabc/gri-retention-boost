import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActionThresholds {
  N1_threshold: number;
  N2_threshold: number;
  N3_threshold: number;
}

async function getActionThresholds(): Promise<ActionThresholds> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'auto_actions')
    .single();

  if (error || !data) {
    // Valores padrão se não encontrar configuração
    return {
      N1_threshold: 40,
      N2_threshold: 65,
      N3_threshold: 85
    };
  }

  return data.value as ActionThresholds;
}

function generateActionTitle(member: any, actionType: 'N1' | 'N2' | 'N3'): string {
  const daysSince = member.days_since_last_checkin || 0;
  
  switch (actionType) {
    case 'N1':
      return `Mensagem motivacional - ${member.name}`;
    case 'N2':
      if (daysSince > 7) {
        return `Verificar motivo da ausência - ${daysSince} dias sem check-in`;
      }
      return `Verificar motivo da queda de frequência - ${member.name}`;
    case 'N3':
      return `Contato urgente - ${daysSince} dias sem check-in`;
    default:
      return `Ação para ${member.name}`;
  }
}

function generateActionDescription(member: any, actionType: 'N1' | 'N2' | 'N3'): string {
  const daysSince = member.days_since_last_checkin || 0;
  const reasons = member.risk_reasons || [];
  
  switch (actionType) {
    case 'N1':
      return `Aluno com queda leve na frequência. Enviar mensagem motivacional e dicas de treino. Motivos: ${reasons.join(', ')}.`;
    case 'N2':
      if (daysSince > 14) {
        return `Aluno sem frequência há ${daysSince} dias. Entrar em contato via WhatsApp para verificar o motivo e oferecer suporte.`;
      }
      return `Aluno com queda significativa na frequência. Entrar em contato para entender se há algum problema e como podemos ajudar. Motivos: ${reasons.join(', ')}.`;
    case 'N3':
      return `Aluno sem frequência há ${daysSince} dias. CONTATO URGENTE via WhatsApp e telefone. Risco alto de cancelamento. Oferecer mudança de plano, pausa ou outros incentivos.`;
    default:
      return `Ação necessária para o aluno ${member.name}.`;
  }
}

function calculateDueDate(actionType: 'N1' | 'N2' | 'N3'): string {
  const now = new Date();
  let daysToAdd = 3; // padrão para N1
  
  switch (actionType) {
    case 'N1':
      daysToAdd = 3;
      break;
    case 'N2':
      daysToAdd = 2;
      break;
    case 'N3':
      daysToAdd = 1; // urgente
      break;
  }
  
  const dueDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return dueDate.toISOString().split('T')[0];
}

function getActionPriority(actionType: 'N1' | 'N2' | 'N3'): 'low' | 'medium' | 'high' {
  switch (actionType) {
    case 'N1': return 'low';
    case 'N2': return 'medium';
    case 'N3': return 'high';
    default: return 'medium';
  }
}

async function generateActionsForMember(member: any, thresholds: ActionThresholds) {
  const riskScore = member.risk_score || 0;
  let actionType: 'N1' | 'N2' | 'N3' | null = null;

  // Determinar tipo de ação baseado no risk score
  if (riskScore >= thresholds.N3_threshold) {
    actionType = 'N3';
  } else if (riskScore >= thresholds.N2_threshold) {
    actionType = 'N2';
  } else if (riskScore >= thresholds.N1_threshold) {
    actionType = 'N1';
  }

  if (!actionType) {
    return null; // Sem ação necessária
  }

  // Verificar se já existe uma ação pendente para este membro
  const { data: existingActions } = await supabase
    .from('action_items')
    .select('id, type, status')
    .eq('member_id', member.id)
    .in('status', ['pending', 'in-progress'])
    .order('created_at', { ascending: false })
    .limit(1);

  // Se já existe uma ação pendente do mesmo tipo ou superior, não criar nova
  if (existingActions && existingActions.length > 0) {
    const existingAction = existingActions[0];
    const existingLevel = existingAction.type === 'N3' ? 3 : existingAction.type === 'N2' ? 2 : 1;
    const newLevel = actionType === 'N3' ? 3 : actionType === 'N2' ? 2 : 1;
    
    if (existingLevel >= newLevel) {
      console.log(`Ação já existe para ${member.name}: ${existingAction.type} (${existingAction.status})`);
      return null;
    }
  }

  // Criar nova ação
  const newAction = {
    member_id: member.id,
    type: actionType,
    priority: getActionPriority(actionType),
    title: generateActionTitle(member, actionType),
    description: generateActionDescription(member, actionType),
    due_date: calculateDueDate(actionType),
    status: 'pending',
  };

  const { data, error } = await supabase
    .from('action_items')
    .insert(newAction)
    .select()
    .single();

  if (error) {
    console.error(`Erro ao criar ação para ${member.name}:`, error);
    return null;
  }

  console.log(`Ação ${actionType} criada para ${member.name} (risk score: ${riskScore})`);
  return data;
}

async function generateAllActionItems() {
  console.log('Iniciando geração de itens de ação...');
  
  try {
    const thresholds = await getActionThresholds();
    
    // Buscar membros que precisam de ações (risk score acima do threshold mínimo)
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select(`
        id,
        name,
        risk_score,
        risk_level,
        risk_reasons,
        days_since_last_checkin,
        checkins_this_month
      `)
      .eq('status', 'active')
      .gte('risk_score', thresholds.N1_threshold);

    if (membersError) throw membersError;

    let processed = 0;
    let created = 0;

    for (const member of members || []) {
      const action = await generateActionsForMember(member, thresholds);
      
      if (action) {
        created++;
      }
      
      processed++;
    }

    return {
      success: true,
      processed,
      created,
      message: `${created} ações criadas para ${processed} membros processados`
    };

  } catch (error) {
    console.error('Erro na geração de itens de ação:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result = await generateAllActionItems();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função generate-action-items:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});