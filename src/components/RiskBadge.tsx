import { RiskLevel } from '@/types/member';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, score, showIcon = true, size = 'md' }: RiskBadgeProps) {
  const config = {
    low: {
      label: 'Risco Baixo',
      variant: 'success' as const,
      icon: CheckCircle,
    },
    medium: {
      label: 'Risco Médio',
      variant: 'warning' as const,
      icon: AlertTriangle,
    },
    high: {
      label: 'Risco Alto',
      variant: 'destructive' as const,
      icon: AlertCircle,
    },
  };

  const { label, variant, icon: Icon } = config[level];

  return (
    <Badge variant={variant} className={size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base px-4 py-2' : ''}>
      {showIcon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
      {label}
      {score !== undefined && ` (${score})`}
    </Badge>
  );
}
