"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useBmUsageLive } from "@/hooks/useBmUsageLive";
import { groupByClient, isPhoneStale, monitorRole, type MonitorRole } from "@/lib/health";
import { formatLiveUpdated } from "@/lib/format";
import { NavHeader } from "@/components/NavHeader";
import { NumberDetailModal } from "@/components/NumberDetailModal";
import { MonitorTile } from "@/components/monitor/MonitorTile";
import { cn } from "@/lib/utils";
import { Loader2, Maximize2, Minimize2, Radio } from "lucide-react";
import type { BmUsageLiveRow, PhoneHealthRow } from "@/types/database";

const TICK_MS = 10_000;
const numberFormatter = new Intl.NumberFormat("pt-BR");

type WakeLockSentinelLike = { release: () => Promise<void> };
type NavigatorWithWakeLock = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
};

/** Mantém a tela ligada enquanto a aba estiver visível (onde o navegador suporta). */
function useScreenWakeLock() {
  useEffect(() => {
    const wakeLock = (navigator as NavigatorWithWakeLock).wakeLock;
    if (!wakeLock) return;

    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;

    const acquire = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const s = await wakeLock.request("screen");
        if (cancelled) {
          s.release().catch(() => {});
        } else {
          sentinel = s;
        }
      } catch {
        // Sem permissão / não suportado — a tela só não fica travada ligada.
      }
    };

    acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", acquire);
      sentinel?.release().catch(() => {});
    };
  }, []);
}

function useIsFullscreen(): boolean {
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  return isFullscreen;
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

const SUMMARY_TONE: Record<MonitorRole | "neutral", string> = {
  good: "text-emerald-700 dark:text-status-good",
  warning: "text-amber-700 dark:text-status-warning",
  critical: "text-status-critical",
  unknown: "text-muted-foreground",
  neutral: "text-foreground",
};

function SummaryItem({
  label,
  value,
  tone,
  highlight = false,
}: {
  label: string;
  value: number;
  tone: MonitorRole | "neutral";
  highlight?: boolean;
}) {
  const active = highlight && value > 0;
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col justify-center rounded-lg border border-border/70 bg-card px-3 py-2",
        active && tone === "critical" && "border-status-critical/40 bg-status-critical-bg",
        active && tone === "warning" && "border-status-warning/40 bg-status-warning-bg"
      )}
    >
      <span
        className={cn(
          "tabular-nums text-2xl leading-none font-bold tracking-tight",
          value > 0 || tone === "neutral" ? SUMMARY_TONE[tone] : "text-muted-foreground"
        )}
      >
        {numberFormatter.format(value)}
      </span>
      <span className="mt-1 truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}

export function MonitorScreen({ userEmail }: { userEmail: string }) {
  const { phones, loading, error, lastUpdated, refresh } = useDashboardData();
  const { rows: usageRows } = useBmUsageLive();
  const [selectedPhone, setSelectedPhone] = useState<PhoneHealthRow | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const isFullscreen = useIsFullscreen();

  useScreenWakeLock();

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const usageByBmId = useMemo(
    () => new Map<string, BmUsageLiveRow>(usageRows.map((u) => [u.bm_id, u])),
    [usageRows]
  );

  // Ordem: clientes com problema primeiro e, dentro do cliente, pior número primeiro.
  const orderedPhones = useMemo(
    () => groupByClient(phones).flatMap((g) => g.phones),
    [phones]
  );

  const summary = useMemo(() => {
    const counts: Record<MonitorRole, number> = { good: 0, warning: 0, critical: 0, unknown: 0 };
    let stale = 0;
    for (const p of phones) {
      const isStale = isPhoneStale(p, now);
      if (isStale) stale += 1;
      counts[monitorRole(p, isStale)] += 1;
    }
    let sent = 0;
    let failed = 0;
    for (const u of usageRows) {
      sent += u.sent_today;
      failed += u.failed_today;
    }
    return { total: phones.length, ...counts, stale, sent, failed };
  }, [phones, usageRows, now]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {!isFullscreen && (
        <NavHeader userEmail={userEmail} loading={loading} lastUpdated={lastUpdated} onRefresh={refresh} />
      )}

      <main className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Monitor</h2>
            <span className="tabular-nums text-sm text-muted-foreground" suppressHydrationWarning>
              {format(now, "EEEE, dd/MM · HH:mm", { locale: ptBR })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Radio className="size-3.5 text-status-good" />
              Atualizado {formatLiveUpdated(lastUpdated)}
            </span>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 rounded-md border border-border/70 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              {isFullscreen ? "Sair" : "Tela cheia"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-status-critical/40 bg-status-critical-bg px-4 py-2 text-sm text-status-critical">
            Erro ao carregar dados: {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          <SummaryItem label="Números" value={summary.total} tone="neutral" />
          <SummaryItem label="OK" value={summary.good} tone="good" />
          <SummaryItem label="Atenção" value={summary.warning} tone="warning" highlight />
          <SummaryItem label="Críticos" value={summary.critical} tone="critical" highlight />
          <SummaryItem label="Sem atualização" value={summary.stale} tone="warning" highlight />
          <SummaryItem label="Enviadas hoje" value={summary.sent} tone="neutral" />
          <SummaryItem label="Falhas hoje" value={summary.failed} tone="critical" highlight />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && phones.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : orderedPhones.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Nenhum número encontrado.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
              {orderedPhones.map((phone) => (
                <MonitorTile
                  key={phone.phone_id}
                  phone={phone}
                  usage={phone.bm_id ? usageByBmId.get(phone.bm_id) : undefined}
                  now={now}
                  onClick={() => setSelectedPhone(phone)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <NumberDetailModal
        phone={selectedPhone}
        onOpenChange={(open) => !open && setSelectedPhone(null)}
      />
    </div>
  );
}
