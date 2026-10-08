import { QualityBadge, StatusBadge } from "@/components/health-badges";
import { formatRelative, orNd } from "@/lib/format";
import { isPhoneStale, monitorRole, type MonitorRole } from "@/lib/health";
import {
  limitBarWidthPercent,
  limitPercentLabel,
  limitRole,
  tierParaNumero,
  type LimitRole,
} from "@/lib/limits";
import { cn } from "@/lib/utils";
import type { BmUsageLiveRow, PhoneHealthRow } from "@/types/database";
import { Clock, TriangleAlert } from "lucide-react";

const ACCENT_CLASS: Record<MonitorRole, string> = {
  good: "bg-status-good",
  warning: "bg-status-warning",
  critical: "bg-status-critical",
  unknown: "bg-status-unknown",
};

const BORDER_CLASS: Record<MonitorRole, string> = {
  good: "border-border/70",
  warning: "border-status-warning/50",
  critical: "border-status-critical/60",
  unknown: "border-border/70",
};

const LIMIT_TEXT_CLASS: Record<LimitRole, string> = {
  good: "text-emerald-700 dark:text-status-good",
  warning: "text-amber-700 dark:text-status-warning",
  critical: "text-status-critical",
  neutral: "text-foreground",
};

const LIMIT_BAR_CLASS: Record<LimitRole, string> = {
  good: "bg-status-good",
  warning: "bg-status-warning",
  critical: "bg-status-critical",
  neutral: "bg-muted-foreground/30",
};

const numberFormatter = new Intl.NumberFormat("pt-BR");

function LimitLine({
  messagingLimit,
  usage,
}: {
  messagingLimit: string | null;
  usage?: BmUsageLiveRow;
}) {
  const limit = tierParaNumero(messagingLimit);

  if (limit === null || usage === undefined) {
    return (
      <p className="text-xs text-muted-foreground">
        Limite: <span className="font-medium text-foreground">{orNd(messagingLimit)}</span>
      </p>
    );
  }

  const sent = usage.sent_today;
  const role = limitRole(sent, limit);
  const percent = limitPercentLabel(sent, limit);
  const limitLabel = limit === Infinity ? "∞" : numberFormatter.format(limit);

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-muted-foreground">Hoje (BM)</span>
        <span className={cn("tabular-nums font-semibold", LIMIT_TEXT_CLASS[role])}>
          {numberFormatter.format(sent)}
          <span className="font-normal text-muted-foreground"> / {limitLabel}</span>
          {percent && <span className="ml-1 font-normal text-muted-foreground">({percent})</span>}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", LIMIT_BAR_CLASS[role])}
          style={{ width: `${limitBarWidthPercent(sent, limit)}%` }}
        />
      </div>
      {usage.failed_today > 0 && (
        <p className="text-[11px] font-medium text-status-critical tabular-nums">
          {numberFormatter.format(usage.failed_today)}{" "}
          {usage.failed_today === 1 ? "falha hoje" : "falhas hoje"}
        </p>
      )}
    </div>
  );
}

export function MonitorTile({
  phone,
  usage,
  now,
  onClick,
}: {
  phone: PhoneHealthRow;
  usage?: BmUsageLiveRow;
  now: number;
  onClick: () => void;
}) {
  const stale = isPhoneStale(phone, now);
  const role = monitorRole(phone, stale);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col gap-2 overflow-hidden rounded-xl border bg-card py-3 pr-3 pl-4 text-left shadow-sm transition-colors hover:border-primary/50",
        BORDER_CLASS[role]
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", ACCENT_CLASS[role])} aria-hidden="true" />

      <div className="min-w-0">
        <p className="truncate text-xl leading-tight font-bold tracking-tight" title={phone.client_name}>
          {phone.client_name}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium tabular-nums text-foreground/80">
          {phone.display_number}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {orNd(phone.verified_name)} · BM {orNd(phone.bm_name)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <QualityBadge quality={phone.quality_rating} />
        <StatusBadge status={phone.status} />
      </div>

      <LimitLine messagingLimit={phone.messaging_limit} usage={usage} />

      <p
        className={cn(
          "mt-auto flex items-center gap-1 text-[11px]",
          stale ? "font-semibold text-amber-700 dark:text-status-warning" : "text-muted-foreground"
        )}
      >
        {stale ? <TriangleAlert className="size-3.5" /> : <Clock className="size-3" />}
        {stale ? "Sem atualização · " : "Atualizado "}
        {formatRelative(phone.last_event_at)}
      </p>
    </button>
  );
}
