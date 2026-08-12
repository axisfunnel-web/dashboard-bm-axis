"use client";

import { useMemo } from "react";
import { useBmUsageLive } from "@/hooks/useBmUsageLive";
import { groupUsageByClient } from "@/lib/limits";
import { formatLiveUpdated } from "@/lib/format";
import { NavHeader } from "@/components/NavHeader";
import { ClientLimitsSection } from "@/components/limits/ClientLimitsSection";
import { Loader2, Radio } from "lucide-react";

export function LimitsScreen({ userEmail }: { userEmail: string }) {
  const { rows, loading, error, lastUpdated, refresh } = useBmUsageLive();
  const clientGroups = useMemo(() => groupUsageByClient(rows), [rows]);

  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader userEmail={userEmail} loading={loading} lastUpdated={lastUpdated} onRefresh={refresh} />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-7 px-4 py-6 sm:px-6">
        {error && (
          <div className="rounded-lg border border-status-critical/40 bg-status-critical-bg px-4 py-3 text-sm text-status-critical">
            Erro ao carregar dados: {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Limite de disparo (hoje)</h2>
            <p className="text-sm text-muted-foreground">
              Consumo do teto diário de mensagens por Business Manager, organizado por cliente.
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Radio className="size-3.5 text-status-good" />
            Atualizado {formatLiveUpdated(lastUpdated)}
          </span>
        </div>

        {loading && rows.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : clientGroups.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma Business Manager encontrada.
          </p>
        ) : (
          clientGroups.map((group) => (
            <ClientLimitsSection key={group.client_name} group={group} />
          ))
        )}
      </main>
    </div>
  );
}
