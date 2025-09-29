import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatsCardProps) {
  const variantClasses = {
    default: 'border-primary/20 bg-primary/5',
    success: 'border-success/20 bg-success-light',
    warning: 'border-warning/20 bg-warning-light',
    destructive: 'border-destructive/20 bg-destructive-light',
  };

  const iconVariants = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  return (
    <Card className={cn('transition-smooth hover:shadow-lg', variantClasses[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
              {trend && (
                <span className={cn('text-sm font-medium', trend.isPositive ? 'text-success' : 'text-destructive')}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn('rounded-full p-3', variantClasses[variant])}>
            <Icon className={cn('h-6 w-6', iconVariants[variant])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
