"use client";

import { useMemo, useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useBmUsageLive } from "@/hooks/useBmUsageLive";
import { computeOverviewStats, groupByClient, isPhoneProblematic, type ClientGroup } from "@/lib/health";
import { OverviewBar } from "@/components/OverviewBar";
import { Filters, type QualityFilter, type StatusFilter } from "@/components/Filters";
import { AttentionBlock } from "@/components/AttentionBlock";
import { ClientSection } from "@/components/ClientSection";
import { AlertsFeed } from "@/components/AlertsFeed";
import { NumberDetailModal } from "@/components/NumberDetailModal";
import { ClientDispatchLogModal } from "@/components/ClientDispatchLogModal";
import { NavHeader } from "@/components/NavHeader";
import { Loader2 } from "lucide-react";
import type { PhoneHealthRow } from "@/types/database";

export function DashboardShell({ userEmail }: { userEmail: string }) {
  const { phones, alerts, critical24hCount, loading, error, lastUpdated, refresh } =
    useDashboardData();
  const { rows: usageRows } = useBmUsageLive();

  const [search, setSearch] = useState("");
  const [quality, setQuality] = useState<QualityFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [selectedPhone, setSelectedPhone] = useState<PhoneHealthRow | null>(null);
  const [dispatchLogClient, setDispatchLogClient] = useState<ClientGroup | null>(null);

  const phonesById = useMemo(() => {
    const map = new Map<string, PhoneHealthRow>();
    for (const p of phones) map.set(p.phone_id, p);
    return map;
  }, [phones]);

  const filteredPhones = useMemo(() => {
    const term = search.trim().toLowerCase();
    return phones.filter((p) => {
      if (quality !== "ALL" && p.quality_rating !== quality) return false;
      if (status !== "ALL" && p.status !== status) return false;
      if (term) {
        const haystack = `${p.client_name} ${p.display_number} ${p.verified_name ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [phones, search, quality, status]);

  const attentionPhones = useMemo(
    () => filteredPhones.filter(isPhoneProblematic),
    [filteredPhones]
  );

  const clientGroups = useMemo(() => groupByClient(filteredPhones), [filteredPhones]);
  const stats = useMemo(() => computeOverviewStats(phones), [phones]);
  const usageByBmId = useMemo(
    () => new Map(usageRows.map((u) => [u.bm_id, u])),
    [usageRows]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader
        userEmail={userEmail}
        loading={loading}
        lastUpdated={lastUpdated}
        onRefresh={() => refresh()}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-7 px-4 py-6 sm:px-6">
        {error && (
          <div className="rounded-lg border border-status-critical/40 bg-status-critical-bg px-4 py-3 text-sm text-status-critical">
            Erro ao carregar dados: {error}
          </div>
        )}

        <OverviewBar stats={stats} critical24hCount={critical24hCount} />

        <Filters
          search={search}
          onSearchChange={setSearch}
          quality={quality}
          onQualityChange={setQuality}
          status={status}
          onStatusChange={setStatus}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {loading && phones.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                <Loader2 className="size-6 animate-spin" />
              </div>
            ) : (
              <>
                <AttentionBlock
                  phones={attentionPhones}
                  onSelectPhone={setSelectedPhone}
                  usageByBmId={usageByBmId}
                />

                {clientGroups.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum número encontrado com os filtros atuais.
                  </p>
                ) : (
                  clientGroups.map((group) => (
                    <ClientSection
                      key={group.client_id}
                      group={group}
                      onSelectPhone={setSelectedPhone}
                      onOpenDispatchLog={setDispatchLogClient}
                      usageByBmId={usageByBmId}
                    />
                  ))
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <AlertsFeed events={alerts} phonesById={phonesById} />
          </div>
        </div>
      </main>

      <NumberDetailModal
        phone={selectedPhone}
        onOpenChange={(open) => !open && setSelectedPhone(null)}
      />

      <ClientDispatchLogModal
        group={dispatchLogClient}
        onOpenChange={(open) => !open && setDispatchLogClient(null)}
      />
    </div>
  );
}
