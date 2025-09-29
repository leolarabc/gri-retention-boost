import { Navigation } from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function Reports() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise detalhada de retenção e eficácia das ações
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Em desenvolvimento</h3>
            <p className="text-sm text-muted-foreground">
              Relatórios detalhados estarão disponíveis em breve
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
