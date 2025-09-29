import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { RiskBadge } from '@/components/RiskBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockMembers } from '@/lib/mock-data';
import { RiskLevel } from '@/types/member';
import { Search, Filter, Phone, Mail, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Members() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');

  const filteredMembers = mockMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery);
    const matchesRisk = riskFilter === 'all' || member.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Alunos</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore todos os alunos da academia
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={riskFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setRiskFilter('all')}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={riskFilter === 'low' ? 'default' : 'outline'}
                  onClick={() => setRiskFilter('low')}
                  size="sm"
                  className="border-success text-success hover:bg-success hover:text-success-foreground"
                >
                  Baixo Risco
                </Button>
                <Button
                  variant={riskFilter === 'medium' ? 'default' : 'outline'}
                  onClick={() => setRiskFilter('medium')}
                  size="sm"
                  className="border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                >
                  Médio Risco
                </Button>
                <Button
                  variant={riskFilter === 'high' ? 'default' : 'outline'}
                  onClick={() => setRiskFilter('high')}
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Alto Risco
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'aluno encontrado' : 'alunos encontrados'}
          </p>
        </div>

        {/* Members grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <Card
              key={member.id}
              className="group cursor-pointer transition-smooth hover:shadow-lg hover:shadow-primary/10"
              onClick={() => navigate(`/members/${member.id}`)}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-lg font-bold text-white">
                      {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-base">
                        {member.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{member.planName}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-base group-hover:opacity-100" />
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{member.phone}</span>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between rounded-lg bg-secondary p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Último check-in</p>
                    <p className="text-sm font-semibold">
                      {member.lastCheckIn
                        ? format(new Date(member.lastCheckIn), "dd/MM/yyyy", { locale: ptBR })
                        : 'Nunca'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Check-ins (mês)</p>
                    <p className="text-sm font-semibold">{member.checkInsThisMonth}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <RiskBadge level={member.riskLevel} size="sm" />
                  <Badge variant="outline" className="text-xs">
                    {member.daysSinceLastCheckIn}d sem check-in
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Filter className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Nenhum aluno encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros ou o termo de busca
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
