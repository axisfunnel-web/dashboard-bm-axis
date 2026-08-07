import { cn } from "@/lib/utils";
import {
  QUALITY_LABELS,
  SEVERITY_LABELS,
  STATUS_LABELS,
  qualityRole,
  severityRole,
  statusRole,
} from "@/lib/health";
import type { EventSeverity, PhoneStatus, QualityRating } from "@/types/database";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  ShieldAlert,
} from "lucide-react";
import type { ComponentType } from "react";

type Role = "good" | "warning" | "critical" | "unknown";

// Light-mode text uses a darkened step of each hue for AA contrast on the tint
// background; dark mode uses the raw status token, validated against the dark surface.
const ROLE_STYLES: Record<Role, string> = {
  good: "bg-status-good-bg text-emerald-700 dark:text-status-good",
  warning: "bg-status-warning-bg text-amber-700 dark:text-status-warning",
  critical: "bg-status-critical-bg text-red-700 dark:text-status-critical",
  unknown: "bg-status-unknown-bg text-muted-foreground",
};

const ROLE_ICON: Record<Role, ComponentType<{ className?: string }>> = {
  good: CheckCircle2,
  warning: AlertTriangle,
  critical: ShieldAlert,
  unknown: HelpCircle,
};

function Pill({
  role,
  label,
  className,
}: {
  role: Role;
  label: string;
  className?: string;
}) {
  const Icon = ROLE_ICON[role];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        ROLE_STYLES[role],
        className
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

export function QualityBadge({ quality }: { quality: QualityRating }) {
  return <Pill role={qualityRole(quality)} label={QUALITY_LABELS[quality]} />;
}

export function StatusBadge({ status }: { status: PhoneStatus }) {
  return <Pill role={statusRole(status)} label={STATUS_LABELS[status]} />;
}

export function SeverityBadge({ severity }: { severity: EventSeverity }) {
  const role = severityRole(severity);
  const Icon = severity === "info" ? Info : ROLE_ICON[role];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        ROLE_STYLES[role]
      )}
    >
      <Icon className="size-3.5" />
      {SEVERITY_LABELS[severity]}
    </span>
  );
}

/** Small colored dot used as a left-accent on cards (color carries no meaning alone — paired with badges) */
export function QualityDot({ quality }: { quality: QualityRating }) {
  const role = qualityRole(quality);
  const colorVar =
    role === "good"
      ? "var(--status-good)"
      : role === "warning"
      ? "var(--status-warning)"
      : role === "critical"
      ? "var(--status-critical)"
      : "var(--status-unknown)";
  return (
    <span
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: colorVar }}
      aria-hidden="true"
    />
  );
}
