import { Navigation } from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Configure regras de risco e preferências do sistema
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <SettingsIcon className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Em desenvolvimento</h3>
            <p className="text-sm text-muted-foreground">
              Configurações avançadas estarão disponíveis em breve
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
