export type RiskLevel = 'low' | 'medium' | 'high';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrollmentDate: string;
  planName: string;
  planValue: number;
  lastCheckIn: string | null;
  daysSinceLastCheckIn: number;
  checkInsThisMonth: number;
  averageCheckInsPerMonth: number;
  riskLevel: RiskLevel;
  riskScore: number;
  riskReasons: string[];
  status: 'active' | 'paused' | 'cancelled';
  avatar?: string;
}

export interface RiskMetrics {
  totalMembers: number;
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
  averageCheckInsPerMonth: number;
  retentionRate: number;
}

export interface ActionItem {
  id: string;
  memberId: string;
  memberName: string;
  type: 'N1' | 'N2' | 'N3';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  memberId: string;
  date: string;
  time: string;
  activity?: string;
}
