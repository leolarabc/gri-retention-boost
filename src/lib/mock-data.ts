import { Member, RiskMetrics, ActionItem, CheckIn } from '@/types/member';

// Mock data para demonstração
export const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Ana Silva Santos',
    email: 'ana.silva@email.com',
    phone: '(11) 98765-4321',
    enrollmentDate: '2023-01-15',
    planName: 'Premium Anual',
    planValue: 189.90,
    lastCheckIn: '2024-01-20',
    daysSinceLastCheckIn: 3,
    checkInsThisMonth: 12,
    averageCheckInsPerMonth: 14,
    riskLevel: 'low',
    riskScore: 15,
    riskReasons: ['Frequência regular', 'Acima da média mensal'],
    status: 'active',
  },
  {
    id: '2',
    name: 'Carlos Eduardo Oliveira',
    email: 'carlos.oliveira@email.com',
    phone: '(11) 91234-5678',
    enrollmentDate: '2023-06-10',
    planName: 'Black Semestral',
    planValue: 249.90,
    lastCheckIn: '2024-01-10',
    daysSinceLastCheckIn: 13,
    checkInsThisMonth: 4,
    averageCheckInsPerMonth: 11,
    riskLevel: 'medium',
    riskScore: 55,
    riskReasons: ['>10 dias sem check-in', 'Queda vs histórico (-64%)'],
    status: 'active',
  },
  {
    id: '3',
    name: 'Mariana Costa Lima',
    email: 'mariana.lima@email.com',
    phone: '(11) 99876-5432',
    enrollmentDate: '2022-09-20',
    planName: 'Premium Mensal',
    planValue: 219.90,
    lastCheckIn: '2023-12-28',
    daysSinceLastCheckIn: 26,
    checkInsThisMonth: 0,
    averageCheckInsPerMonth: 16,
    riskLevel: 'high',
    riskScore: 92,
    riskReasons: ['>20 dias sem check-in', 'Zero check-ins no mês', 'Queda vs histórico (-100%)'],
    status: 'active',
  },
  {
    id: '4',
    name: 'Roberto Almeida Junior',
    email: 'roberto.almeida@email.com',
    phone: '(11) 97654-3210',
    enrollmentDate: '2023-11-05',
    planName: 'Standard Trimestral',
    planValue: 149.90,
    lastCheckIn: '2024-01-21',
    daysSinceLastCheckIn: 2,
    checkInsThisMonth: 8,
    averageCheckInsPerMonth: 9,
    riskLevel: 'low',
    riskScore: 20,
    riskReasons: ['Frequência consistente'],
    status: 'active',
  },
  {
    id: '5',
    name: 'Juliana Ferreira Souza',
    email: 'juliana.souza@email.com',
    phone: '(11) 98123-4567',
    enrollmentDate: '2023-03-12',
    planName: 'Premium Anual',
    planValue: 189.90,
    lastCheckIn: '2024-01-15',
    daysSinceLastCheckIn: 8,
    checkInsThisMonth: 6,
    averageCheckInsPerMonth: 13,
    riskLevel: 'medium',
    riskScore: 48,
    riskReasons: ['Queda vs histórico (-54%)'],
    status: 'active',
  },
  {
    id: '6',
    name: 'Pedro Henrique Martins',
    email: 'pedro.martins@email.com',
    phone: '(11) 99234-5678',
    enrollmentDate: '2022-07-18',
    planName: 'Black Anual',
    planValue: 279.90,
    lastCheckIn: '2024-01-22',
    daysSinceLastCheckIn: 1,
    checkInsThisMonth: 15,
    averageCheckInsPerMonth: 18,
    riskLevel: 'low',
    riskScore: 10,
    riskReasons: ['Excelente frequência', 'Acima da média'],
    status: 'active',
  },
];

export const mockMetrics: RiskMetrics = {
  totalMembers: 247,
  lowRisk: 178,
  mediumRisk: 45,
  highRisk: 24,
  averageCheckInsPerMonth: 12.4,
  retentionRate: 91.2,
};

export const mockActions: ActionItem[] = [
  {
    id: 'a1',
    memberId: '3',
    memberName: 'Mariana Costa Lima',
    type: 'N3',
    priority: 'high',
    title: 'Contato urgente - 26 dias sem check-in',
    description: 'Aluna sem frequência há quase um mês. Entrar em contato imediatamente via WhatsApp e telefone.',
    dueDate: '2024-01-24',
    status: 'pending',
    createdAt: '2024-01-23',
  },
  {
    id: 'a2',
    memberId: '2',
    memberName: 'Carlos Eduardo Oliveira',
    type: 'N2',
    priority: 'medium',
    title: 'Verificar motivo da queda de frequência',
    description: 'Aluno com queda de 64% na frequência. Enviar mensagem para entender se há algum problema.',
    dueDate: '2024-01-25',
    status: 'pending',
    createdAt: '2024-01-23',
  },
  {
    id: 'a3',
    memberId: '5',
    memberName: 'Juliana Ferreira Souza',
    type: 'N1',
    priority: 'medium',
    title: 'Mensagem motivacional',
    description: 'Aluna com frequência abaixo da média. Enviar mensagem com dicas de treino e incentivo.',
    dueDate: '2024-01-26',
    status: 'in-progress',
    assignedTo: 'Coordenador',
    createdAt: '2024-01-22',
  },
];

export const mockCheckIns: CheckIn[] = [
  { id: 'c1', memberId: '1', date: '2024-01-22', time: '07:30', activity: 'Musculação' },
  { id: 'c2', memberId: '1', date: '2024-01-20', time: '07:15', activity: 'Musculação' },
  { id: 'c3', memberId: '1', date: '2024-01-18', time: '18:45', activity: 'Funcional' },
  { id: 'c4', memberId: '2', date: '2024-01-10', time: '19:00', activity: 'Crossfit' },
  { id: 'c5', memberId: '2', date: '2024-01-08', time: '19:15', activity: 'Crossfit' },
];

export function getMemberById(id: string): Member | undefined {
  return mockMembers.find(m => m.id === id);
}

export function getCheckInsByMemberId(memberId: string): CheckIn[] {
  return mockCheckIns.filter(c => c.memberId === memberId);
}

export function getActionsByMemberId(memberId: string): ActionItem[] {
  return mockActions.filter(a => a.memberId === memberId);
}
