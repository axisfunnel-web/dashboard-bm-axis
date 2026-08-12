"use client";

import { useMemo, useState } from "react";
import { useDispatchData, type DispatchRangeDays } from "@/hooks/useDispatchData";
import { aggregateByClient, aggregateByDay, buildPhoneMetaMap, computeTotals } from "@/lib/dispatch";
import { groupByClient, type ClientGroup } from "@/lib/health";
import { NavHeader } from "@/components/NavHeader";
import { PeriodSelector } from "@/components/PeriodSelector";
import { DispatchSummaryCards } from "@/components/dispatch/DispatchSummaryCards";
import { DispatchTrendChart } from "@/components/dispatch/DispatchTrendChart";
import { ClientDispatchList } from "@/components/dispatch/ClientDispatchList";
import { ClientLogList } from "@/components/dispatch/ClientLogList";
import { ClientDispatchLogModal } from "@/components/ClientDispatchLogModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export function DispatchScreen({ userEmail }: { userEmail: string }) {
  const [rangeDays, setRangeDays] = useState<DispatchRangeDays>(7);
  const { phones, stats, loading, error, lastUpdated, refresh } = useDispatchData(rangeDays);

  const [scopeClientId, setScopeClientId] = useState<string>("ALL");
  const [scopePhoneId, setScopePhoneId] = useState<string>("ALL");
  const [dispatchLogClient, setDispatchLogClient] = useState<ClientGroup | null>(null);

  const phoneMap = useMemo(() => buildPhoneMetaMap(phones), [phones]);
  const clients = useMemo(() => aggregateByClient(stats, phoneMap), [stats, phoneMap]);
  const totals = useMemo(() => computeTotals(stats), [stats]);
  const clientGroups = useMemo(() => groupByClient(phones), [phones]);

  const scopeClient = clients.find((c) => c.client_id === scopeClientId);
  const trendData = useMemo(
    () =>
      aggregateByDay(stats, phoneMap, {
        clientId: scopeClientId === "ALL" ? undefined : scopeClientId,
        phoneNumberId: scopePhoneId === "ALL" ? undefined : scopePhoneId,
      }),
    [stats, phoneMap, scopeClientId, scopePhoneId]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader userEmail={userEmail} loading={loading} lastUpdated={lastUpdated} onRefresh={refresh} />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-7 px-4 py-6 sm:px-6">
        {error && (
          <div className="rounded-lg border border-status-critical/40 bg-status-critical-bg px-4 py-3 text-sm text-status-critical">
            Erro ao carregar dados: {error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Disparos</h2>
          <PeriodSelector value={rangeDays} onChange={setRangeDays} />
        </div>

        {loading && stats.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <>
            <DispatchSummaryCards totals={totals} />

            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Enviados vs. entregues por dia</CardTitle>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Select
                    value={scopeClientId}
                    onValueChange={(v) => {
                      setScopeClientId(v ?? "ALL");
                      setScopePhoneId("ALL");
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-52">
                      <SelectValue placeholder="Cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos os clientes</SelectItem>
                      {clients.map((c) => (
                        <SelectItem key={c.client_id} value={c.client_id}>
                          {c.client_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {scopeClient && (
                    <Select value={scopePhoneId} onValueChange={(v) => setScopePhoneId(v ?? "ALL")}>
                      <SelectTrigger className="w-full sm:w-52">
                        <SelectValue placeholder="Número" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos os números</SelectItem>
                        {scopeClient.phones.map((p) => (
                          <SelectItem key={p.phone_number_id} value={p.phone_number_id}>
                            {p.display_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <DispatchTrendChart data={trendData} />
              </CardContent>
            </Card>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
                Por cliente
              </h3>
              <ClientDispatchList clients={clients} />
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
                  Logs de disparos por cliente
                </h3>
                <p className="text-xs text-muted-foreground">
                  Histórico completo de sucesso/erro por mensagem, com filtro por número e por
                  dia, e exportação em .csv/.xls — independente do período selecionado acima.
                </p>
              </div>
              <ClientLogList groups={clientGroups} onOpenLog={setDispatchLogClient} />
            </section>
          </>
        )}
      </main>

      <ClientDispatchLogModal
        group={dispatchLogClient}
        onOpenChange={(open) => !open && setDispatchLogClient(null)}
      />
    </div>
  );
}
