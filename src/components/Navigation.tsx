import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, CheckSquare, Settings, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/members', label: 'Alunos', icon: Users },
  { to: '/actions', label: 'Fila de Ações', icon: CheckSquare },
  { to: '/reports', label: 'Relatórios', icon: BarChart3 },
  { to: '/settings', label: 'Configurações', icon: Settings },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                <span className="text-lg font-bold text-white">GRI</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">GRI</h1>
                <p className="text-xs text-muted-foreground">Gestão de Retenção Inteligente</p>
              </div>
            </Link>

            <div className="flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-base',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">Academia Modelo</p>
              <p className="text-xs text-muted-foreground">Gestor</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-primary" />
          </div>
        </div>
      </div>
    </nav>
  );
}
