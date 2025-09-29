import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const pactoApiKey = Deno.env.get("PACTO_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function syncMembers(matricula: string) {
  console.log(`Sincronizando membros para matrícula: ${matricula}`);
  
  try {
    // Por enquanto, vamos usar dados mock já que a API da Pacto requer endpoints específicos
    // que não temos todos os parâmetros necessários (alunoId, fichaId)
    console.log('Usando dados mock para demonstração...');
    
    const mockMembersData = [
      {
        matricula: matricula,
        alunoId: 'A001',
        fichaId: 'F001',
        nome: 'João Silva Santos',
        email: 'joao.silva@email.com',
        telefone: '(11) 98765-4321',
        dataMatricula: '2023-01-15',
        plano: { nome: 'Premium Anual', valor: 189.90 },
        status: 'ativo'
      },
      {
        matricula: matricula,
        alunoId: 'A002', 
        fichaId: 'F002',
        nome: 'Maria Oliveira Costa',
        email: 'maria.oliveira@email.com',
        telefone: '(11) 91234-5678',
        dataMatricula: '2023-06-10',
        plano: { nome: 'Black Semestral', valor: 249.90 },
        status: 'ativo'
      },
      {
        matricula: matricula,
        alunoId: 'A003',
        fichaId: 'F003', 
        nome: 'Carlos Eduardo Lima',
        email: 'carlos.lima@email.com',
        telefone: '(11) 99876-5432',
        dataMatricula: '2022-09-20',
        plano: { nome: 'Premium Mensal', valor: 219.90 },
        status: 'ativo'
      },
      {
        matricula: matricula,
        alunoId: 'A004',
        fichaId: 'F004',
        nome: 'Ana Paula Ferreira',
        email: 'ana.ferreira@email.com',
        telefone: '(11) 97654-3210',
        dataMatricula: '2023-11-05',
        plano: { nome: 'Standard Trimestral', valor: 149.90 },
        status: 'ativo'
      },
      {
        matricula: matricula,
        alunoId: 'A005',
        fichaId: 'F005',
        nome: 'Roberto Almeida Junior',
        email: 'roberto.almeida@email.com',
        telefone: '(11) 98123-4567',
        dataMatricula: '2023-03-12',
        plano: { nome: 'Black Anual', valor: 279.90 },
        status: 'ativo'
      }
    ];

    // Buscar gym padrão
    const { data: gym } = await supabase
      .from('gyms')
      .select('id')
      .eq('pacto_matricula', matricula)
      .single();

    let processedCount = 0;

    for (const memberData of mockMembersData) {
      // Gerar dados variáveis para simular realismo
      const daysSinceLastCheckin = Math.floor(Math.random() * 35);
      const checkinsThisMonth = Math.floor(Math.random() * 20);
      const avgCheckinsPerMonth = 8 + Math.floor(Math.random() * 12);
      
      // Calcular risk level baseado nos dados
      let riskLevel = 'low';
      let riskScore = Math.floor(Math.random() * 25);
      let riskReasons = ['Frequência regular'];

      if (daysSinceLastCheckin > 20) {
        riskLevel = 'high';
        riskScore = 75 + Math.floor(Math.random() * 25);
        riskReasons = [`${daysSinceLastCheckin} dias sem check-in`, 'Risco de cancelamento'];
      } else if (daysSinceLastCheckin > 10 || checkinsThisMonth < avgCheckinsPerMonth * 0.6) {
        riskLevel = 'medium';
        riskScore = 40 + Math.floor(Math.random() * 30);
        riskReasons = [`${daysSinceLastCheckin} dias sem check-in`, 'Queda na frequência'];
      }

      // Inserir ou atualizar membro no banco
      const { error } = await supabase
        .from('members')
        .upsert({
          pacto_member_id: `${matricula}_${memberData.alunoId}`,
          pacto_matricula: matricula,
          pacto_aluno_id: memberData.alunoId,
          pacto_ficha_id: memberData.fichaId,
          name: memberData.nome,
          email: memberData.email,
          phone: memberData.telefone,
          enrollment_date: new Date(memberData.dataMatricula).toISOString().split('T')[0],
          plan_value: memberData.plano?.valor || 0,
          status: memberData.status === 'ativo' ? 'active' : 'cancelled',
          gym_id: gym?.id,
          days_since_last_checkin: daysSinceLastCheckin,
          checkins_this_month: checkinsThisMonth,
          average_checkins_per_month: avgCheckinsPerMonth,
          risk_level: riskLevel,
          risk_score: riskScore,
          risk_reasons: riskReasons,
          last_checkin: daysSinceLastCheckin === 0 ? new Date().toISOString() : 
                       daysSinceLastCheckin < 30 ? new Date(Date.now() - daysSinceLastCheckin * 24 * 60 * 60 * 1000).toISOString() : null
        }, {
          onConflict: 'pacto_member_id'
        });

      if (error) {
        console.error('Erro ao sincronizar membro:', error);
      } else {
        console.log(`Membro sincronizado: ${memberData.nome} (${riskLevel} risk)`);
        processedCount++;
      }
    }

    return { success: true, processed: processedCount };
  } catch (error) {
    console.error('Erro na sincronização de membros:', error);
    throw error;
  }
}

async function syncCheckins(matricula: string) {
  console.log(`Sincronizando check-ins para matrícula: ${matricula}`);
  
  try {
    // Buscar todos os membros da matrícula
    const { data: members } = await supabase
      .from('members')
      .select('id, pacto_aluno_id, name')
      .eq('pacto_matricula', matricula);

    if (!members || members.length === 0) {
      console.log('Nenhum membro encontrado para sincronizar check-ins');
      return { success: true, processed: 0 };
    }

    let totalProcessed = 0;

    for (const member of members) {
      // Gerar check-ins mock para cada membro
      const checkinsCount = 3 + Math.floor(Math.random() * 5); // 3-7 check-ins
      
      for (let i = 0; i < checkinsCount; i++) {
        const daysAgo = i * 2 + Math.floor(Math.random() * 3); // Espaçar check-ins
        const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        
        const activities = ['Musculação', 'Funcional', 'Crossfit', 'Cardio', 'Pilates'];
        const times = ['07:00', '07:30', '08:00', '18:00', '18:30', '19:00', '19:30', '20:00'];
        
        const { error } = await supabase
          .from('checkins')
          .upsert({
            member_id: member.id,
            pacto_aula_id: `AULA_${member.pacto_aluno_id}_${i}`,
            checkin_date: date.toISOString().split('T')[0],
            checkin_time: times[Math.floor(Math.random() * times.length)],
            activity: activities[Math.floor(Math.random() * activities.length)],
            confirmed: true,
          }, {
            onConflict: 'member_id,pacto_aula_id'
          });

        if (!error) {
          totalProcessed++;
        }
      }
      
      console.log(`Check-ins criados para ${member.name}: ${checkinsCount}`);
    }

    return { success: true, processed: totalProcessed };
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

    let processed = 0;

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

      // Calcular média histórica (últimos 3 meses)
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const historicalCheckins = checkins?.filter(c => 
        new Date(c.checkin_date) >= threeMonthsAgo
      ).length || 0;
      const averageCheckinsPerMonth = Math.round((historicalCheckins / 3) * 10) / 10;

      // Atualizar estatísticas
      const { error: updateError } = await supabase
        .from('members')
        .update({
          last_checkin: lastCheckin ? new Date(lastCheckin).toISOString() : null,
          days_since_last_checkin: daysSinceLastCheckin,
          checkins_this_month: checkinsThisMonth,
          average_checkins_per_month: averageCheckinsPerMonth,
        })
        .eq('id', member.id);

      if (updateError) {
        console.error('Erro ao atualizar estatísticas:', updateError);
      } else {
        processed++;
      }
    }

    return { success: true, processed };
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
    const { syncType, matricula } = await req.json();
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
        result = await syncMembers(matricula || 'MAT001');
        break;
      case 'checkins':
        result = await syncCheckins(matricula || 'MAT001');
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

    console.log(`Sincronização ${syncType} concluída:`, result);

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