import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useActionItems } from '@/hooks/useData';
import { updateActionItem } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, Clock, AlertTriangle, RefreshCw, User, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Actions() {
  const { toast } = useToast();
  const { actions, isLoading, error, refetch } = useActionItems();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [updatingAction, setUpdatingAction] = useState<string | null>(null);

  const filteredActions = (actions || []).filter((action: any) => {
    const matchesStatus = statusFilter === 'all' || action.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || action.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || action.type === typeFilter;
    return matchesStatus && matchesPriority && matchesType;
  });

  const handleUpdateStatus = async (actionId: string, newStatus: string, result?: string) => {
    setUpdatingAction(actionId);
    try {
      const updates: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.result = result || 'Ação concluída';
      }

      const response = await updateActionItem(actionId, updates);
      
      if (response.error) {
        throw new Error(response.error);
      }

      await refetch();
      toast({
        title: 'Ação atualizada',
        description: `Status alterado para ${newStatus === 'completed' ? 'concluída' : newStatus === 'in-progress' ? 'em andamento' : 'pendente'}`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar ação',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setUpdatingAction(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'default';
      case 'cancelled': return 'secondary';
      default: return 'warning';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in-progress': return 'Em Andamento';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Carregando ações...</p>
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
            <h1 className="mb-2 text-4xl font-bold">Fila de Ações</h1>
            <p className="text-muted-foreground">
              Gerencie e execute ações de retenção de alunos
            </p>
          </div>

          <Button
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-destructive">
            <p className="font-medium">Erro ao carregar ações</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Prioridade</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as prioridades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="N1">N1 - Motivacional</SelectItem>
                    <SelectItem value="N2">N2 - Verificação</SelectItem>
                    <SelectItem value="N3">N3 - Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setTypeFilter('all');
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Ações */}
        <div className="space-y-4">
          {filteredActions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CheckSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">Nenhuma ação encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  Tente ajustar os filtros ou aguarde a geração de novas ações
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredActions.map((action: any) => (
              <Card key={action.id} className="transition-smooth hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(action.priority)}>
                          {action.type}
                        </Badge>
                        <Badge variant="outline">
                          {getPriorityLabel(action.priority)}
                        </Badge>
                        <Badge variant={getStatusColor(action.status) as any}>
                          {getStatusLabel(action.status)}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {action.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(action.id, 'in-progress')}
                          disabled={updatingAction === action.id}
                        >
                          Iniciar
                        </Button>
                      )}
                      {action.status === 'in-progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(action.id, 'completed')}
                          disabled={updatingAction === action.id}
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Aluno:</span>
                        <span>{action.member?.name || 'N/A'}</span>
                      </div>
                      
                      {action.due_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Vencimento:</span>
                          <span>{format(parseISO(action.due_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Criada em:</span>
                        <span>{format(parseISO(action.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                    </div>

                    {action.result && (
                      <div className="rounded-lg bg-secondary p-3">
                        <p className="text-sm font-medium mb-1">Resultado:</p>
                        <p className="text-sm text-muted-foreground">{action.result}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Estatísticas */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-warning/10 p-2">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium">Pendentes</p>
                  <p className="text-2xl font-bold">
                    {actions?.filter((a: any) => a.status === 'pending').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Em Andamento</p>
                  <p className="text-2xl font-bold">
                    {actions?.filter((a: any) => a.status === 'in-progress').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-success/10 p-2">
                  <CheckSquare className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium">Concluídas</p>
                  <p className="text-2xl font-bold">
                    {actions?.filter((a: any) => a.status === 'completed').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-destructive/10 p-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium">Alta Prioridade</p>
                  <p className="text-2xl font-bold">
                    {actions?.filter((a: any) => a.priority === 'high' && a.status !== 'completed').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}