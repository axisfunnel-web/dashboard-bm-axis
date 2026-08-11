import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatusCounts } from "@/hooks/useErrorsData";

const SEGMENTS: { key: keyof StatusCounts; label: string; className: string }[] = [
  { key: "delivered", label: "Entregues", className: "bg-status-good" },
  { key: "read", label: "Lidas", className: "bg-chart-1" },
  { key: "sent", label: "Enviadas (sem confirmação)", className: "bg-status-unknown" },
  { key: "failed", label: "Falharam", className: "bg-status-critical" },
];

export function DeliveryBreakdown({ counts }: { counts: StatusCounts }) {
  const total = counts.delivered + counts.read + counts.sent + counts.failed;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saúde de entrega no período</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">Sem eventos de mensagem no período.</p>
        ) : (
          <>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
              {SEGMENTS.map((seg) => {
                const value = counts[seg.key];
                if (value === 0) return null;
                return (
                  <div
                    key={seg.key}
                    className={seg.className}
                    style={{ width: `${(value / total) * 100}%` }}
                    title={`${seg.label}: ${value}`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
              {SEGMENTS.map((seg) => (
                <div key={seg.key} className="flex items-center gap-1.5">
                  <span className={`size-2.5 shrink-0 rounded-full ${seg.className}`} />
                  <span className="text-muted-foreground">{seg.label}:</span>
                  <span className="font-medium tabular-nums">{counts[seg.key]}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
