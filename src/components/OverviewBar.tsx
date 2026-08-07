import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OverviewStats } from "@/lib/health";
import {
  AlertTriangle,
  Building2,
  Phone,
  ShieldAlert,
  Users,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";

interface StatTileProps {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  emphasis?: "neutral" | "critical";
}

function StatTile({ label, value, icon: Icon, emphasis = "neutral" }: StatTileProps) {
  const isCritical = emphasis === "critical" && value > 0;
  return (
    <Card
      className={cn(
        "transition-colors",
        isCritical && "border-status-critical/30 bg-status-critical-bg"
      )}
    >
      <CardContent className="flex items-center gap-3 py-1">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10",
            isCritical && "bg-status-critical/15"
          )}
        >
          <Icon
            className={cn(
              "size-4 text-primary",
              isCritical && "text-status-critical"
            )}
          />
        </div>
        <div className="min-w-0">
          <p
            className={cn(
              "tabular-nums text-2xl leading-none font-bold tracking-tight",
              isCritical && "text-status-critical"
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

function QualityChip({
  colorVar,
  label,
  value,
}: {
  colorVar: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: colorVar }}
        aria-hidden="true"
      />
      <span className="tabular-nums font-medium">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

export function OverviewBar({
  stats,
  critical24hCount,
}: {
  stats: OverviewStats;
  critical24hCount: number;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Clientes" value={stats.totalClients} icon={Users} />
        <StatTile label="BMs" value={stats.totalBms} icon={Building2} />
        <StatTile label="Números" value={stats.totalPhones} icon={Phone} />
        <StatTile
          label="Com problema"
          value={stats.problemCount}
          icon={ShieldAlert}
          emphasis="critical"
        />
        <StatTile
          label="Críticos (24h)"
          value={critical24hCount}
          icon={Zap}
          emphasis="critical"
        />
        <StatTile
          label="Qualidade desconhecida"
          value={stats.byQuality.UNKNOWN}
          icon={AlertTriangle}
        />
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 py-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Qualidade
          </span>
          <QualityChip colorVar="var(--status-good)" label="Alta (GREEN)" value={stats.byQuality.GREEN} />
          <QualityChip colorVar="var(--status-warning)" label="Média (YELLOW)" value={stats.byQuality.YELLOW} />
          <QualityChip colorVar="var(--status-critical)" label="Baixa (RED)" value={stats.byQuality.RED} />
          <QualityChip colorVar="var(--status-unknown)" label="Desconhecida" value={stats.byQuality.UNKNOWN} />
        </CardContent>
      </Card>
    </div>
  );
}
