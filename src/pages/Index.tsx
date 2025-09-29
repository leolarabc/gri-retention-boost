import { Navigation } from '@/components/Navigation';
import { StatsCard } from '@/components/StatsCard';
import { RiskBadge } from '@/components/RiskBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockMembers, mockMetrics, mockActions } from '@/lib/mock-data';
import { 
  Users, TrendingUp, Activity, AlertCircle, 
  ArrowRight, Clock, CheckCircle2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function Index() {
  const navigate = useNavigate();

  const highRiskMembers = mockMembers.filter((m) => m.riskLevel === 'high').slice(0, 5);
  const recentActions = mockActions.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da retenção de alunos e métricas de risco
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Alunos"
            value={mockMetrics.totalMembers}
            icon={Users}
            variant="default"
            trend={{ value: 5.2, isPositive: true }}
            subtitle="vs mês anterior"
          />
          <StatsCard
            title="Risco Baixo"
            value={mockMetrics.lowRisk}
            icon={CheckCircle2}
            variant="success"
            subtitle={`${((mockMetrics.lowRisk / mockMetrics.totalMembers) * 100).toFixed(1)}% do total`}
          />
          <StatsCard
            title="Risco Médio"
            value={mockMetrics.mediumRisk}
            icon={AlertCircle}
            variant="warning"
            subtitle={`${((mockMetrics.mediumRisk / mockMetrics.totalMembers) * 100).toFixed(1)}% do total`}
          />
          <StatsCard
            title="Risco Alto"
            value={mockMetrics.highRisk}
            icon={AlertCircle}
            variant="destructive"
            trend={{ value: 12.5, isPositive: false }}
            subtitle="requer atenção imediata"
          />
        </div>

        {/* Secondary Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card className="border-primary/20 bg-primary/5 transition-smooth hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Taxa de Retenção</p>
                  <p className="text-4xl font-bold">{mockMetrics.retentionRate}%</p>
                  <p className="mt-2 text-sm text-muted-foreground">Meta: 95%</p>
                </div>
                <div className="rounded-full bg-primary/10 p-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-gradient-primary transition-all"
                  style={{ width: `${mockMetrics.retentionRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent/5 transition-smooth hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">
                    Média de Check-ins/Mês
                  </p>
                  <p className="text-4xl font-bold">{mockMetrics.averageCheckInsPerMonth}</p>
                  <p className="mt-2 text-sm text-muted-foreground">por aluno ativo</p>
                </div>
                <div className="rounded-full bg-accent/10 p-4">
                  <Activity className="h-8 w-8 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* High Risk Members */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Alunos em Risco Alto
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/members')}
              >
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {highRiskMembers.length > 0 ? (
                <div className="space-y-3">
                  {highRiskMembers.map((member) => (
                    <div
                      key={member.id}
                      className="group flex cursor-pointer items-center justify-between rounded-lg border border-border p-4 transition-smooth hover:bg-destructive-light hover:border-destructive"
                      onClick={() => navigate(`/members/${member.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-white">
                          {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-semibold group-hover:text-destructive transition-base">
                            {member.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.daysSinceLastCheckIn}d sem check-in • {member.checkInsThisMonth} check-ins no mês
                          </p>
                        </div>
                      </div>
                      <RiskBadge level={member.riskLevel} score={member.riskScore} showIcon={false} size="sm" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="mb-3 h-10 w-10 text-success" />
                  <p className="text-sm font-medium">Nenhum aluno em risco alto!</p>
                  <p className="text-xs text-muted-foreground">Todos os alunos estão bem</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Actions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Ações Pendentes
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/actions')}
              >
                Ver todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActions.map((action) => (
                  <div
                    key={action.id}
                    className="rounded-lg border border-border p-4 transition-smooth hover:bg-secondary"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            action.priority === 'high'
                              ? 'destructive'
                              : action.priority === 'medium'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {action.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {action.priority === 'high' ? 'Urgente' : action.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h4 className="mb-1 font-semibold">{action.title}</h4>
                    <p className="mb-2 text-xs text-muted-foreground">{action.memberName}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    <div className="mt-3">
                      <Button size="sm" className="w-full">
                        Executar ação
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Distribution Chart Placeholder */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Distribuição de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end justify-around gap-4">
              <div className="flex flex-1 flex-col items-center">
                <div
                  className="w-full rounded-t-lg bg-success transition-all hover:opacity-80"
                  style={{ height: `${(mockMetrics.lowRisk / mockMetrics.totalMembers) * 100}%` }}
                />
                <p className="mt-3 text-sm font-semibold">{mockMetrics.lowRisk}</p>
                <p className="text-xs text-muted-foreground">Risco Baixo</p>
              </div>
              <div className="flex flex-1 flex-col items-center">
                <div
                  className="w-full rounded-t-lg bg-warning transition-all hover:opacity-80"
                  style={{ height: `${(mockMetrics.mediumRisk / mockMetrics.totalMembers) * 100}%` }}
                />
                <p className="mt-3 text-sm font-semibold">{mockMetrics.mediumRisk}</p>
                <p className="text-xs text-muted-foreground">Risco Médio</p>
              </div>
              <div className="flex flex-1 flex-col items-center">
                <div
                  className="w-full rounded-t-lg bg-destructive transition-all hover:opacity-80"
                  style={{ height: `${(mockMetrics.highRisk / mockMetrics.totalMembers) * 100}%` }}
                />
                <p className="mt-3 text-sm font-semibold">{mockMetrics.highRisk}</p>
                <p className="text-xs text-muted-foreground">Risco Alto</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
