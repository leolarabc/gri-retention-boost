import { Navigation } from '@/components/Navigation';
import { StatsCard } from '@/components/StatsCard';
import { RiskBadge } from '@/components/RiskBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRiskMetrics, useMembers, useActionItems, useSync } from '@/hooks/useData';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Users, TrendingDown, TrendingUp, Clock, RefreshCw, Calculator, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { metrics, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useRiskMetrics();
  const { members, isLoading: membersLoading, refetch: refetchMembers } = useMembers();
  const { actions, isLoading: actionsLoading, refetch: refetchActions } = useActionItems();
  const { isSyncing, lastSync, syncData, calculateRisk, generateActions } = useSync();

  // Filtrar membros de alto risco
  const highRiskMembers = members?.filter(member => member.risk_level === 'high').slice(0, 5) || [];

  // Filtrar ações pendentes
  const pendingActions = actions?.filter(action => action.status === 'pending').slice(0, 5) || [];

  const handleSync = async () => {
    try {
      toast({ title: 'Iniciando sincronização...', description: 'Importando dados da Pacto API' });
      
      // Sincronizar membros
      await syncData('members');
      await syncData('checkins');
      await syncData('stats');
      
      // Calcular risk scores
      await calculateRisk();
      
      // Gerar ações automáticas
      await generateActions();
      
      // Atualizar dados da tela
      await Promise.all([refetchMetrics(), refetchMembers(), refetchActions()]);
      
      toast({
        title: 'Sincronização concluída!',
        description: 'Dados atualizados com sucesso',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erro na sincronização',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    }
  };

  const handleCalculateRisk = async () => {
    try {
      toast({ title: 'Calculando risk scores...', description: 'Processando dados dos alunos' });
      await calculateRisk();
      await refetchMetrics();
      await refetchMembers();
      toast({
        title: 'Risk scores atualizados!',
        description: 'Cálculos concluídos com sucesso',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erro no cálculo',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    }
  };

  const handleGenerateActions = async () => {
    try {
      toast({ title: 'Gerando ações...', description: 'Criando ações automáticas' });
      await generateActions();
      await refetchActions();
      toast({
        title: 'Ações geradas!',
        description: 'Novas ações criadas automaticamente',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erro na geração de ações',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    }
  };

  if (metricsLoading && membersLoading && actionsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral da retenção de alunos e ações prioritárias
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCalculateRisk}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Calcular Risk Scores
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerateActions}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Gerar Ações
            </Button>
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Pacto'}
            </Button>
          </div>
        </div>

        {lastSync && (
          <div className="mb-6 rounded-lg bg-secondary p-3">
            <p className="text-sm text-muted-foreground">
              Última sincronização: {format(lastSync, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        )}

        {metricsError && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-destructive">
            <p className="font-medium">Erro ao carregar métricas</p>
            <p className="text-sm">{metricsError}</p>
          </div>
        )}

        {/* Métricas principais */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Alunos"
            value={metrics?.totalMembers?.toString() || '0'}
            icon={Users}
            trend={{ value: 5.2, isPositive: true }}
          />
          <StatsCard
            title="Baixo Risco"
            value={metrics?.lowRisk?.toString() || '0'}
            icon={TrendingUp}
            variant="success"
          />
          <StatsCard
            title="Médio Risco"
            value={metrics?.mediumRisk?.toString() || '0'}
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Alto Risco"
            value={metrics?.highRisk?.toString() || '0'}
            icon={AlertTriangle}
            variant="destructive"
            trend={{ value: -2.1, isPositive: false }}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Alunos de Alto Risco */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Alunos de Alto Risco
              </CardTitle>
              <CardDescription>Membros que precisam de atenção imediata</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {highRiskMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                    <p>Nenhum aluno em alto risco</p>
                    <p className="text-sm">Excelente! Continue o bom trabalho</p>
                  </div>
                ) : (
                  highRiskMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-secondary"
                      onClick={() => navigate(`/members/${member.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-white">
                          {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.days_since_last_checkin || 0} dias sem check-in
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <RiskBadge level={member.risk_level} />
                        <Badge variant="outline" className="text-xs">
                          Score: {member.risk_score || 0}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ações Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Ações Pendentes
              </CardTitle>
              <CardDescription>Tarefas que precisam ser executadas</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {pendingActions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="mx-auto h-8 w-8 mb-2" />
                    <p>Nenhuma ação pendente</p>
                    <p className="text-sm">Todas as ações foram concluídas</p>
                  </div>
                ) : (
                  pendingActions.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'default' : 'secondary'}>
                            {action.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {action.priority === 'high' ? 'Alta' : action.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                        <p className="mt-1 font-medium">{action.title}</p>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                        {action.due_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Vence em: {format(parseISO(action.due_date), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Ações Rápidas</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/members')}
            >
              <Users className="h-6 w-6" />
              Ver Todos os Alunos
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/actions')}
            >
              <Clock className="h-6 w-6" />
              Fila de Ações
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/reports')}
            >
              <TrendingUp className="h-6 w-6" />
              Relatórios
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}