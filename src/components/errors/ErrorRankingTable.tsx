import { orNd, formatDateTime } from "@/lib/format";
import type { ErrorRankingRow } from "@/lib/errors";

export function ErrorRankingTable({ rows }: { rows: ErrorRankingRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum erro registrado no período selecionado.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground uppercase tracking-wide">
            <th className="py-2 pr-4 font-medium">Código</th>
            <th className="py-2 pr-4 font-medium">Descrição</th>
            <th className="py-2 pr-4 font-medium text-right">Ocorrências</th>
            <th className="py-2 pr-4 font-medium">Última ocorrência</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b last:border-b-0">
              <td className="py-2 pr-4 font-mono tabular-nums font-medium">
                {row.error_code ?? "—"}
              </td>
              <td className="py-2 pr-4 text-muted-foreground">{orNd(row.error_title)}</td>
              <td className="py-2 pr-4 text-right tabular-nums font-semibold">{row.count}</td>
              <td className="py-2 pr-4 text-muted-foreground">
                {formatDateTime(row.lastOccurrence)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
