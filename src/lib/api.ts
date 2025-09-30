import { supabase } from '@/integrations/supabase/client';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Funções para gerenciar membros
export async function getMembers() {
  const { data, error } = await supabase
    .from('members')
    .select(`
      *,
      current_plan:plans(name, value),
      checkins:checkins(checkin_date, checkin_time, activity)
    `)
    .order('name');

  if (error) {
    console.error('Erro ao buscar membros:', error);
    return { error: 'Erro ao carregar membros' };
  }

  return { data };
}

export async function getMemberById(id: string) {
  const { data, error } = await supabase
    .from('members')
    .select(`
      *,
      current_plan:plans(name, value),
      checkins:checkins(checkin_date, checkin_time, activity),
      action_items:action_items(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar membro:', error);
    return { error: 'Erro ao carregar dados do membro' };
  }

  return { data };
}

// Funções para métricas de risco
export async function getRiskMetrics() {
  try {
    const { data: members, error } = await supabase
      .from('members')
      .select('risk_level, status')
      .eq('status', 'active');

    if (error) throw error;

    const totalMembers = members?.length || 0;
    const lowRisk = members?.filter(m => m.risk_level === 'low').length || 0;
    const mediumRisk = members?.filter(m => m.risk_level === 'medium').length || 0;
    const highRisk = members?.filter(m => m.risk_level === 'high').length || 0;

    // Calcular taxa de retenção (simulada)
    const retentionRate = totalMembers > 0 ? ((totalMembers - highRisk) / totalMembers) * 100 : 0;

    // Calcular média de check-ins (simulada)
    const { data: avgData } = await supabase
      .from('members')
      .select('average_checkins_per_month')
      .eq('status', 'active');

    const averageCheckInsPerMonth = avgData?.reduce((sum, m) => 
      sum + (m.average_checkins_per_month || 0), 0
    ) / (avgData?.length || 1);

    return {
      data: {
        totalMembers,
        lowRisk,
        mediumRisk,
        highRisk,
        averageCheckInsPerMonth: Math.round(averageCheckInsPerMonth * 10) / 10,
        retentionRate: Math.round(retentionRate * 10) / 10,
      }
    };
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return { error: 'Erro ao carregar métricas' };
  }
}

// Funções para ações
export async function getActionItems() {
  const { data, error } = await supabase
    .from('action_items')
    .select(`
      *,
      member:members(name, risk_level)
    `)
    .order('due_date');

  if (error) {
    console.error('Erro ao buscar ações:', error);
    return { error: 'Erro ao carregar ações' };
  }

  return { data };
}

export async function updateActionItem(id: string, updates: any) {
  const { data, error } = await supabase
    .from('action_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar ação:', error);
    return { error: 'Erro ao atualizar ação' };
  }

  return { data };
}

// Funções para sincronização com Pacto API
export async function syncPactoData(syncType: 'members' | 'checkins' | 'stats', params?: any) {
  try {
    const { data, error } = await supabase.functions.invoke('sync-pacto-data', {
      body: {
        syncType,
        matricula: 'MAT001', // academia padrão
        ...params
      }
    });

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return { error: 'Erro na sincronização com Pacto API' };
  }
}

// Função para calcular risk scores
export async function calculateRiskScores() {
  try {
    const { data, error } = await supabase.functions.invoke('calculate-risk-scores');

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Erro no cálculo de risk scores:', error);
    return { error: 'Erro no cálculo de risk scores' };
  }
}

// Função para gerar ações automáticas
export async function generateActionItems() {
  try {
    const { data, error } = await supabase.functions.invoke('generate-action-items');

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Erro na geração de ações:', error);
    return { error: 'Erro na geração de ações' };
  }
}

// Funções para configurações
export async function getSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    console.error('Erro ao buscar configurações:', error);
    return { error: 'Erro ao carregar configurações' };
  }

  return { data };
}

export async function updateSetting(key: string, value: any) {
  const { data, error } = await supabase
    .from('settings')
    .update({ value })
    .eq('key', key)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar configuração:', error);
    return { error: 'Erro ao atualizar configuração' };
  }

  return { data };
}