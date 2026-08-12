import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import { limitBarWidthPercent, limitPercentLabel, limitRole, tierParaNumero } from "@/lib/limits";
import type { BmUsageTodayRow } from "@/types/database";

const BAR_CLASS: Record<string, string> = {
  good: "bg-status-good",
  warning: "bg-status-warning",
  critical: "bg-status-critical",
  neutral: "bg-muted-foreground/30",
};

const TEXT_CLASS: Record<string, string> = {
  good: "text-emerald-700 dark:text-status-good",
  warning: "text-amber-700 dark:text-status-warning",
  critical: "text-status-critical",
  neutral: "text-muted-foreground",
};

const numberFormatter = new Intl.NumberFormat("pt-BR");

export function BmLimitCard({
  usage,
  sentOverride,
}: {
  usage: BmUsageTodayRow;
  /** Future live counter (message_events, status='sent' today) — overrides sent_today when provided. Not wired yet. */
  sentOverride?: number;
}) {
  const sent = sentOverride ?? usage.sent_today;
  const limit = tierParaNumero(usage.messaging_limit);
  const role = limitRole(sent, limit);
  const percentLabel = limitPercentLabel(sent, limit);
  const barWidth = limitBarWidthPercent(sent, limit);

  const limitLabel =
    limit === null
      ? usage.messaging_limit
        ? usage.messaging_limit
        : "n/d"
      : limit === Infinity
        ? "∞"
        : numberFormatter.format(limit);

  return (
    <Card>
      <CardContent className="space-y-2.5 py-1">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-sm font-semibold">{usage.bm_name}</p>
          {percentLabel && (
            <span className={cn("shrink-0 text-xs font-semibold tabular-nums", TEXT_CLASS[role])}>
              {percentLabel}
            </span>
          )}
        </div>

        <p className="tabular-nums text-lg font-bold tracking-tight">
          {numberFormatter.format(sent)}
          <span className="font-normal text-muted-foreground"> / {limitLabel}</span>
        </p>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", BAR_CLASS[role])}
            style={{ width: `${barWidth}%` }}
          />
        </div>

        <p className="text-[11px] text-muted-foreground">
          Atualizado {formatRelative(usage.messaging_limit_updated_at)}
        </p>
      </CardContent>
    </Card>
  );
}
