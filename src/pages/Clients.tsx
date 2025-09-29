import { useClients } from "../hooks/useClients";
import { ClientsTable } from "../components/ClientsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function Clients() {
  const { data, loading, error } = useClients();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Carregando clientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          {error && (
            <div className="text-red-600 text-sm">
              <strong>Erro:</strong> {error}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            Modo: {import.meta.env.VITE_API_BASE_URL ? 'API Externa' : 'Supabase Local'}
          </div>
        </CardHeader>
        <CardContent>
          <ClientsTable data={data} />
        </CardContent>
      </Card>
    </div>
  );
}