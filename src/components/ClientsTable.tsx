import type { Client } from "../types";

export function ClientsTable({ data }: { data: Client[] }) {
  if (!data?.length) return <div className="text-sm text-muted-foreground">Nenhum cliente encontrado.</div>;
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-3 py-2 text-left">Nome</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Telefone</th>
            <th className="px-3 py-2 text-left">Criado em</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="px-3 py-2">{c.name}</td>
              <td className="px-3 py-2">{c.email ?? "—"}</td>
              <td className="px-3 py-2">{c.phone ?? "—"}</td>
              <td className="px-3 py-2">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}