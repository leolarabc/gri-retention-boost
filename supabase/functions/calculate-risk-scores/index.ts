import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RiskWeights {
  days_without_checkin: number;
  checkin_frequency_drop: number;
  plan_downgrade: number;
  pause_request: number;
  payment_issues: number;
}

interface RiskThresholds {
  low: number;
  medium: number;
  high: number;
}

async function getSettings() {
  const { data: weights } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'risk_weights')
    .single();

  const { data: thresholds } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'risk_thresholds')
    .single();

  return {
    weights: weights?.value as RiskWeights,
    thresholds: thresholds?.value as RiskThresholds,
  };
}

function calculateRiskScore(
  member: any,
  checkins: any[],
  planChanges: any[],
  pauseRequests: any[],
  weights: RiskWeights
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Dias sem check-in
  const daysSinceLastCheckin = member.days_since_last_checkin || 0;
  if (daysSinceLastCheckin > 30) {
    score += weights.days_without_checkin;
    reasons.push(`>30 dias sem check-in (${daysSinceLastCheckin} dias)`);
  } else if (daysSinceLastCheckin > 20) {
    score += weights.days_without_checkin * 0.8;
    reasons.push(`>20 dias sem check-in (${daysSinceLastCheckin} dias)`);
  } else if (daysSinceLastCheckin > 14) {
    score += weights.days_without_checkin * 0.6;
    reasons.push(`>14 dias sem check-in (${daysSinceLastCheckin} dias)`);
  } else if (daysSinceLastCheckin > 7) {
    score += weights.days_without_checkin * 0.3;
    reasons.push(`>7 dias sem check-in (${daysSinceLastCheckin} dias)`);
  }

  // 2. Queda na frequência de check-ins
  const currentMonthCheckins = member.checkins_this_month || 0;
  const avgCheckins = member.average_checkins_per_month || 0;
  
  if (avgCheckins > 0) {
    const frequencyDrop = ((avgCheckins - currentMonthCheckins) / avgCheckins) * 100;
    
    if (frequencyDrop > 70) {
      score += weights.checkin_frequency_drop;
      reasons.push(`Queda vs histórico (-${Math.round(frequencyDrop)}%)`);
    } else if (frequencyDrop > 50) {
      score += weights.checkin_frequency_drop * 0.8;
      reasons.push(`Queda vs histórico (-${Math.round(frequencyDrop)}%)`);
    } else if (frequencyDrop > 30) {
      score += weights.checkin_frequency_drop * 0.5;
      reasons.push(`Queda vs histórico (-${Math.round(frequencyDrop)}%)`);
    }
  }

  if (currentMonthCheckins === 0) {
    score += weights.checkin_frequency_drop * 0.5;
    reasons.push('Zero check-ins no mês');
  }

  // 3. Mudanças de plano (downgrades)
  const recentDowngrades = planChanges.filter(pc => 
    pc.change_type === 'downgrade' && 
    new Date(pc.change_date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // últimos 90 dias
  );

  if (recentDowngrades.length > 0) {
    score += weights.plan_downgrade;
    reasons.push('Downgrade recente no plano');
  }

  // 4. Solicitações de pausa
  const activePauseRequests = pauseRequests.filter(pr => pr.status === 'active');
  if (activePauseRequests.length > 0) {
    score += weights.pause_request;
    reasons.push('Solicitação de pausa ativa');
  }

  // 5. Frequência consistente (fator positivo)
  if (currentMonthCheckins >= avgCheckins && daysSinceLastCheckin <= 3) {
    reasons.push('Frequência regular');
  }

  if (currentMonthCheckins > avgCheckins * 1.2) {
    reasons.push('Acima da média mensal');
  }

  return { score: Math.min(score, 100), reasons };
}

function getRiskLevel(score: number, thresholds: RiskThresholds): 'low' | 'medium' | 'high' {
  if (score <= thresholds.low) return 'low';
  if (score <= thresholds.medium) return 'medium';
  return 'high';
}

async function calculateAllRiskScores() {
  console.log('Iniciando cálculo de risk scores...');
  
  try {
    const { weights, thresholds } = await getSettings();
    
    if (!weights || !thresholds) {
      throw new Error('Configurações de risco não encontradas');
    }

    // Buscar todos os membros ativos
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select(`
        id,
        pacto_member_id,
        name,
        days_since_last_checkin,
        checkins_this_month,
        average_checkins_per_month
      `)
      .eq('status', 'active');

    if (membersError) throw membersError;

    let processed = 0;
    let updated = 0;

    for (const member of members || []) {
      // Buscar dados relacionados
      const [checkinsResult, planChangesResult, pauseRequestsResult] = await Promise.all([
        supabase
          .from('checkins')
          .select('checkin_date')
          .eq('member_id', member.id)
          .order('checkin_date', { ascending: false })
          .limit(100),
        
        supabase
          .from('plan_changes')
          .select('change_type, change_date')
          .eq('member_id', member.id),
        
        supabase
          .from('pause_requests')
          .select('status, start_date')
          .eq('member_id', member.id)
          .eq('status', 'active')
      ]);

      const { score, reasons } = calculateRiskScore(
        member,
        checkinsResult.data || [],
        planChangesResult.data || [],
        pauseRequestsResult.data || [],
        weights
      );

      const riskLevel = getRiskLevel(score, thresholds);

      // Atualizar membro com novo risk score
      const { error: updateError } = await supabase
        .from('members')
        .update({
          risk_score: Math.round(score),
          risk_level: riskLevel,
          risk_reasons: reasons,
        })
        .eq('id', member.id);

      if (updateError) {
        console.error(`Erro ao atualizar risk score para ${member.name}:`, updateError);
      } else {
        updated++;
        console.log(`Risk score atualizado para ${member.name}: ${score} (${riskLevel})`);
      }

      processed++;
    }

    return {
      success: true,
      processed,
      updated,
      message: `Risk scores calculados para ${updated} de ${processed} membros`
    };

  } catch (error) {
    console.error('Erro no cálculo de risk scores:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result = await calculateAllRiskScores();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função calculate-risk-scores:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});