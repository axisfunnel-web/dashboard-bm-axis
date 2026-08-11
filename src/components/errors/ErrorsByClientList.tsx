import type { ClientErrorSummary } from "@/lib/errors";

export function ErrorsByClientList({ rows }: { rows: ClientErrorSummary[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhuma falha por cliente no período selecionado.
      </p>
    );
  }

  const max = Math.max(...rows.map((r) => r.count));

  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <li key={row.client_id} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-sm font-medium sm:w-40">
            {row.client_name}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-status-critical"
              style={{ width: `${max > 0 ? (row.count / max) * 100 : 0}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums">
            {row.count}
          </span>
        </li>
      ))}
    </ul>
  );
}
