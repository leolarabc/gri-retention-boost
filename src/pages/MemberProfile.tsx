import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { RiskBadge } from '@/components/RiskBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getMemberById, getCheckInsByMemberId, getActionsByMemberId } from '@/lib/mock-data';
import { 
  ArrowLeft, Phone, Mail, Calendar, CreditCard, TrendingDown, 
  TrendingUp, Activity, AlertCircle, CheckCircle2, Clock 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = getMemberById(id!);
  const checkIns = getCheckInsByMemberId(id!);
  const actions = getActionsByMemberId(id!);

  if (!member) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Aluno não encontrado</h3>
              <Button onClick={() => navigate('/members')} className="mt-4">
                Voltar para lista
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/members')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para lista
        </Button>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary text-2xl font-bold text-white">
              {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h1 className="mb-2 text-3xl font-bold">{member.name}</h1>
              <div className="mb-3 flex flex-wrap gap-2">
                <RiskBadge level={member.riskLevel} score={member.riskScore} />
                <Badge variant={member.status === 'active' ? 'success' : 'outline'}>
                  {member.status === 'active' ? 'Ativo' : member.status === 'paused' ? 'Pausado' : 'Cancelado'}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${member.email}`} className="hover:text-primary transition-base">
                    {member.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${member.phone}`} className="hover:text-primary transition-base">
                    {member.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Phone className="mr-2 h-4 w-4" />
              Ligar
            </Button>
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Enviar mensagem
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Risk Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Análise de Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Score de Risco</span>
                    <span className="text-2xl font-bold">{member.riskScore}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full transition-all ${
                        member.riskLevel === 'low'
                          ? 'bg-success'
                          : member.riskLevel === 'medium'
                          ? 'bg-warning'
                          : 'bg-destructive'
                      }`}
                      style={{ width: `${member.riskScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Motivos do Risco:</h4>
                  <ul className="space-y-2">
                    {member.riskReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Check-in History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Histórico de Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                {checkIns.length > 0 ? (
                  <div className="space-y-3">
                    {checkIns.map((checkIn) => (
                      <div
                        key={checkIn.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3 transition-base hover:bg-secondary"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-light">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {format(new Date(checkIn.date), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {checkIn.time} {checkIn.activity && `• ${checkIn.activity}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Activity className="mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Nenhum check-in registrado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Ações Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {actions.length > 0 ? (
                  <div className="space-y-3">
                    {actions.map((action) => (
                      <div
                        key={action.id}
                        className="rounded-lg border border-border p-4 transition-base hover:bg-secondary"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <Badge
                              variant={
                                action.priority === 'high'
                                  ? 'destructive'
                                  : action.priority === 'medium'
                                  ? 'warning'
                                  : 'default'
                              }
                              className="mb-2"
                            >
                              {action.type}
                            </Badge>
                            <h4 className="font-semibold">{action.title}</h4>
                          </div>
                          <Badge variant="outline">
                            {action.status === 'pending'
                              ? 'Pendente'
                              : action.status === 'in-progress'
                              ? 'Em andamento'
                              : action.status === 'completed'
                              ? 'Concluída'
                              : 'Cancelada'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm">Executar ação</Button>
                          <Button size="sm" variant="outline">
                            Marcar como concluída
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle2 className="mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Nenhuma ação pendente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Plan info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Plano Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plano</p>
                  <p className="text-lg font-semibold">{member.planName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Mensal</p>
                  <p className="text-lg font-semibold">
                    {member.planValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Matrícula</p>
                  <p className="text-sm">
                    {format(new Date(member.enrollmentDate), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Check-ins este mês</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{member.checkInsThisMonth}</span>
                    {member.checkInsThisMonth < member.averageCheckInsPerMonth && (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    {member.checkInsThisMonth >= member.averageCheckInsPerMonth && (
                      <TrendingUp className="h-4 w-4 text-success" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Média mensal</span>
                  <span className="text-2xl font-bold">{member.averageCheckInsPerMonth}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dias sem check-in</span>
                  <span className="text-2xl font-bold">{member.daysSinceLastCheckIn}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Último check-in</span>
                  <span className="text-sm font-medium">
                    {member.lastCheckIn
                      ? format(new Date(member.lastCheckIn), "dd/MM/yyyy", { locale: ptBR })
                      : 'Nunca'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
