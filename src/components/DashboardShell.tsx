"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDashboardData } from "@/hooks/useDashboardData";
import { computeOverviewStats, groupByClient, isPhoneProblematic } from "@/lib/health";
import { OverviewBar } from "@/components/OverviewBar";
import { Filters, type QualityFilter, type StatusFilter } from "@/components/Filters";
import { AttentionBlock } from "@/components/AttentionBlock";
import { ClientSection } from "@/components/ClientSection";
import { AlertsFeed } from "@/components/AlertsFeed";
import { NumberDetailModal } from "@/components/NumberDetailModal";
import { LogoutButton } from "@/components/LogoutButton";
import { Activity, Loader2, RefreshCw } from "lucide-react";
import type { PhoneHealthRow } from "@/types/database";

const ThemeToggle = dynamic(
  () => import("@/components/ThemeToggle").then((m) => m.ThemeToggle),
  { ssr: false }
);

export function DashboardShell({ userEmail }: { userEmail: string }) {
  const { phones, alerts, critical24hCount, loading, error, lastUpdated, refresh } =
    useDashboardData();

  const [search, setSearch] = useState("");
  const [quality, setQuality] = useState<QualityFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [selectedPhone, setSelectedPhone] = useState<PhoneHealthRow | null>(null);

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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
              <Activity className="size-4" />
            </div>
            <div>
              <h1 className="text-base leading-tight font-semibold tracking-tight sm:text-lg">
                Painel de Saúde de BMs
              </h1>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              {loading && lastUpdated === null ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <button
                  onClick={() => refresh()}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted hover:text-foreground"
                  title="Atualizar agora"
                >
                  <RefreshCw className="size-3.5" />
                  {lastUpdated
                    ? `Atualizado ${formatDistanceToNow(lastUpdated, { addSuffix: true, locale: ptBR })}`
                    : "—"}
                </button>
              )}
            </div>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

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
    </div>
  );
}
