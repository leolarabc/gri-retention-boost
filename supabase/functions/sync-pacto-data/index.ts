import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const pactoApiKey = Deno.env.get("PACTO_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PactoMember {
  matricula: string;
  alunoId: string;
  fichaId: string;
  nome: string;
  email?: string;
  telefone?: string;
  dataMatricula: string;
  plano?: {
    nome: string;
    valor: number;
  };
  status: string;
}

interface PactoCheckin {
  alulaId: string;
  alunoId: string;
  data: string;
  hora: string;
  atividade?: string;
  confirmado: boolean;
}

async function callPactoAPI(endpoint: string, options: RequestInit = {}) {
  const baseUrl = 'https://apigw.pactosolucoes.com.br';
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${pactoApiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Pacto API Error: ${response.status} - ${response.statusText}`);
  }

  return await response.json();
}

async function syncMembers(matricula: string) {
  console.log(`Sincronizando membros para matrícula: ${matricula}`);
  
  try {
    // Buscar dados dos alunos na Pacto API
    const membersData = await callPactoAPI(`/aluno/${matricula}`);
    
    for (const memberData of membersData) {
      // Buscar informações detalhadas do aluno
      const detailedInfo = await callPactoAPI(
        `/aluno/${matricula}/${memberData.alunoId}/${memberData.fichaId}/obter-informacoes-aluno`
      );

      // Inserir ou atualizar membro no banco
      const { error } = await supabase
        .from('members')
        .upsert({
          pacto_member_id: `${matricula}_${memberData.alunoId}`,
          pacto_matricula: matricula,
          pacto_aluno_id: memberData.alunoId,
          pacto_ficha_id: memberData.fichaId,
          name: detailedInfo.nome || memberData.nome,
          email: detailedInfo.email,
          phone: detailedInfo.telefone,
          enrollment_date: new Date(detailedInfo.dataMatricula).toISOString().split('T')[0],
          plan_value: detailedInfo.plano?.valor || 0,
          status: detailedInfo.status === 'ativo' ? 'active' : 'cancelled',
        }, {
          onConflict: 'pacto_member_id'
        });

      if (error) {
        console.error('Erro ao sincronizar membro:', error);
      }
    }

    return { success: true, processed: membersData.length };
  } catch (error) {
    console.error('Erro na sincronização de membros:', error);
    throw error;
  }
}

async function syncCheckins(matricula: string, memberId: string) {
  console.log(`Sincronizando check-ins para membro: ${memberId}`);
  
  try {
    // Buscar check-ins do aluno
    const checkinsData = await callPactoAPI(`/programa/aulasAgendadasPorAluno/${matricula}`);
    
    // Buscar ID do membro no banco
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('pacto_member_id', `${matricula}_${memberId}`)
      .single();

    if (!member) {
      console.error(`Membro não encontrado: ${matricula}_${memberId}`);
      return { success: false, processed: 0 };
    }

    for (const checkinData of checkinsData) {
      const { error } = await supabase
        .from('checkins')
        .upsert({
          member_id: member.id,
          pacto_aula_id: checkinData.aulaId,
          checkin_date: new Date(checkinData.data).toISOString().split('T')[0],
          checkin_time: checkinData.hora,
          activity: checkinData.atividade,
          confirmed: checkinData.confirmado || false,
        }, {
          onConflict: 'member_id,pacto_aula_id'
        });

      if (error) {
        console.error('Erro ao sincronizar check-in:', error);
      }
    }

    return { success: true, processed: checkinsData.length };
  } catch (error) {
    console.error('Erro na sincronização de check-ins:', error);
    throw error;
  }
}

async function updateMemberStats() {
  console.log('Atualizando estatísticas dos membros...');
  
  try {
    // Buscar todos os membros
    const { data: members, error } = await supabase
      .from('members')
      .select('id, pacto_member_id');

    if (error) throw error;

    for (const member of members || []) {
      // Calcular estatísticas de check-in
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { data: checkins } = await supabase
        .from('checkins')
        .select('checkin_date')
        .eq('member_id', member.id)
        .order('checkin_date', { ascending: false });

      const checkinsThisMonth = checkins?.filter(c => 
        new Date(c.checkin_date) >= startOfMonth
      ).length || 0;

      const lastCheckin = checkins?.[0]?.checkin_date;
      const daysSinceLastCheckin = lastCheckin 
        ? Math.floor((now.getTime() - new Date(lastCheckin).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Atualizar estatísticas
      const { error: updateError } = await supabase
        .from('members')
        .update({
          last_checkin: lastCheckin ? new Date(lastCheckin).toISOString() : null,
          days_since_last_checkin: daysSinceLastCheckin,
          checkins_this_month: checkinsThisMonth,
        })
        .eq('id', member.id);

      if (updateError) {
        console.error('Erro ao atualizar estatísticas:', updateError);
      }
    }

    return { success: true, processed: members?.length || 0 };
  } catch (error) {
    console.error('Erro na atualização de estatísticas:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { syncType, matricula, memberId } = await req.json();
    let result;

    // Log da sincronização
    const { data: syncLog } = await supabase
      .from('sync_logs')
      .insert({
        sync_type: syncType,
        status: 'success',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    const startTime = Date.now();

    switch (syncType) {
      case 'members':
        result = await syncMembers(matricula);
        break;
      case 'checkins':
        result = await syncCheckins(matricula, memberId);
        break;
      case 'stats':
        result = await updateMemberStats();
        break;
      default:
        throw new Error(`Tipo de sincronização inválido: ${syncType}`);
    }

    const duration = Date.now() - startTime;

    // Atualizar log de sincronização
    if (syncLog) {
      await supabase
        .from('sync_logs')
        .update({
          status: result.success ? 'success' : 'error',
          records_processed: result.processed,
          completed_at: new Date().toISOString(),
          duration_ms: duration,
        })
        .eq('id', syncLog.id);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na sincronização:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});