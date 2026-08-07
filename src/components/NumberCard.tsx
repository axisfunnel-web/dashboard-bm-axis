import { formatRelative, orNd } from "@/lib/format";
import { QUALITY_LABELS, STATUS_LABELS, qualityRole, statusRole } from "@/lib/health";
import { cn } from "@/lib/utils";
import type { PhoneHealthRow } from "@/types/database";
import { CheckCircle2 } from "lucide-react";

type Role = "good" | "warning" | "critical" | "unknown";

const DOT_CLASS: Record<Role, string> = {
  good: "bg-status-good",
  warning: "bg-status-warning",
  critical: "bg-status-critical",
  unknown: "bg-status-unknown",
};

const TEXT_CLASS: Record<Role, string> = {
  good: "text-status-good",
  warning: "text-status-warning",
  critical: "text-status-critical",
  unknown: "text-white/70",
};

function StatItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium tracking-wider text-white/40 uppercase">
        {label}
      </p>
      <p className={cn("mt-0.5 truncate text-sm font-semibold text-white/90", className)}>
        {value}
      </p>
    </div>
  );
}

export function NumberCard({
  phone,
  onClick,
}: {
  phone: PhoneHealthRow;
  onClick: () => void;
}) {
  const qRole = qualityRole(phone.quality_rating);
  const sRole = statusRole(phone.status);
  const nameApproved = (phone.name_status ?? "").toUpperCase() === "APPROVED";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="cursor-pointer rounded-2xl border border-white/10 bg-[#111319] p-5 shadow-lg shadow-black/20 transition-colors hover:border-white/20 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-wider text-white/50 uppercase">
          <span className={cn("size-2 shrink-0 rounded-full", DOT_CLASS[sRole])} aria-hidden="true" />
          {STATUS_LABELS[phone.status]} · {orNd(phone.bm_name)}
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium tracking-wider text-white/40 uppercase">
            Nome verificado
          </p>
          <div className="mt-0.5 flex items-center justify-end gap-1.5">
            <span className="truncate text-sm font-medium text-white/90">
              {orNd(phone.verified_name)}
            </span>
            {nameApproved && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300">
                <CheckCircle2 className="size-3" />
                Verificado
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 truncate text-3xl font-bold tracking-tight text-white tabular-nums sm:text-4xl">
        {phone.display_number}
      </p>

      <p className="mt-1 truncate text-xs text-white/40">
        {phone.client_name} · {orNd(phone.waba_name)} · Último evento{" "}
        {formatRelative(phone.last_event_at)}
      </p>

      <div className="my-4 border-t border-white/10" />

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatItem
          label="Qualidade"
          value={QUALITY_LABELS[phone.quality_rating]}
          className={TEXT_CLASS[qRole]}
        />
        <StatItem
          label="Status"
          value={STATUS_LABELS[phone.status]}
          className={TEXT_CLASS[sRole]}
        />
        <StatItem label="Revisão da conta" value={orNd(phone.account_review_status)} />
        <StatItem label="Verificação" value={orNd(phone.business_verification_status)} />
        <StatItem label="Limite de msgs" value={orNd(phone.messaging_limit)} />
        <StatItem label="Último evento" value={formatRelative(phone.last_event_at)} />
      </div>
    </div>
  );
}
