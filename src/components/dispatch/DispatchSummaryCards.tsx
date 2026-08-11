import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LOW_DELIVERY_RATE_THRESHOLD, type DispatchTotals } from "@/lib/dispatch";
import { Send, CheckCheck, Gauge } from "lucide-react";
import type { ComponentType } from "react";

function formatCount(value: number): string {
  return value.toLocaleString("pt-BR");
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function SummaryTile({
  label,
  value,
  icon: Icon,
  critical,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  critical?: boolean;
}) {
  return (
    <Card className={cn(critical && "border-status-critical/30 bg-status-critical-bg")}>
      <CardContent className="flex items-center gap-3 py-1">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10",
            critical && "bg-status-critical/15"
          )}
        >
          <Icon className={cn("size-4 text-primary", critical && "text-status-critical")} />
        </div>
        <div className="min-w-0">
          <p
            className={cn(
              "tabular-nums text-2xl leading-none font-bold tracking-tight",
              critical && "text-status-critical"
            )}
          >
            {value}
          </p>
          <p className="text-xs leading-snug text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DispatchSummaryCards({ totals }: { totals: DispatchTotals }) {
  const lowDelivery = totals.sent > 0 && totals.rate < LOW_DELIVERY_RATE_THRESHOLD;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SummaryTile label="Enviados no período" value={formatCount(totals.sent)} icon={Send} />
      <SummaryTile
        label="Entregues no período"
        value={formatCount(totals.delivered)}
        icon={CheckCheck}
      />
      <SummaryTile
        label="Taxa de entrega"
        value={totals.sent > 0 ? formatPercent(totals.rate) : "n/d"}
        icon={Gauge}
        critical={lowDelivery}
      />
    </div>
  );
}

export { formatCount, formatPercent };
