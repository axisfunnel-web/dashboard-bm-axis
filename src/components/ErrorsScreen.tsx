"use client";

import { useMemo, useState } from "react";
import { useErrorsData, type ErrorsRangeDays } from "@/hooks/useErrorsData";
import { buildPhoneMetaMap } from "@/lib/dispatch";
import { aggregateErrorRanking, aggregateErrorsByClient } from "@/lib/errors";
import { NavHeader } from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorFilters, type ErrorFilterOption } from "@/components/errors/ErrorFilters";
import { ErrorRankingTable } from "@/components/errors/ErrorRankingTable";
import { ErrorsByClientList } from "@/components/errors/ErrorsByClientList";
import { FailuresFeed } from "@/components/errors/FailuresFeed";
import { DeliveryBreakdown } from "@/components/errors/DeliveryBreakdown";
import { Loader2 } from "lucide-react";

const RECENT_FEED_LIMIT = 80;

export function ErrorsScreen({ userEmail }: { userEmail: string }) {
  const [rangeDays, setRangeDays] = useState<ErrorsRangeDays>(7);
  const { phones, events, statusCounts, loading, error, lastUpdated, refresh } =
    useErrorsData(rangeDays);

  const [clientId, setClientId] = useState("ALL");
  const [phoneId, setPhoneId] = useState("ALL");
  const [errorCode, setErrorCode] = useState("ALL");

  const phoneMap = useMemo(() => buildPhoneMetaMap(phones), [phones]);

  const clientOptions = useMemo<ErrorFilterOption[]>(() => {
    const seen = new Map<string, string>();
    for (const p of phones) seen.set(p.client_id, p.client_name);
    return Array.from(seen.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [phones]);

  const phoneOptions = useMemo<ErrorFilterOption[]>(() => {
    return phones
      .filter((p) => clientId === "ALL" || p.client_id === clientId)
      .filter((p) => p.meta_phone_number_id)
      .map((p) => ({ value: p.meta_phone_number_id, label: p.display_number }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [phones, clientId]);

  const clientFilteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (clientId === "ALL" && phoneId === "ALL") return true;
      const meta = phoneMap.get(e.phone_number_id);
      if (phoneId !== "ALL") return e.phone_number_id === phoneId;
      if (clientId !== "ALL") return meta?.client_id === clientId;
      return true;
    });
  }, [events, phoneMap, clientId, phoneId]);

  const errorCodeOptions = useMemo<ErrorFilterOption[]>(() => {
    const seen = new Map<string, string>();
    for (const e of clientFilteredEvents) {
      const key = e.error_code !== null ? String(e.error_code) : "sem_codigo";
      if (!seen.has(key)) seen.set(key, e.error_code !== null ? String(e.error_code) : "Sem código");
    }
    return Array.from(seen.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [clientFilteredEvents]);

  const filteredEvents = useMemo(() => {
    if (errorCode === "ALL") return clientFilteredEvents;
    return clientFilteredEvents.filter((e) => {
      const key = e.error_code !== null ? String(e.error_code) : "sem_codigo";
      return key === errorCode;
    });
  }, [clientFilteredEvents, errorCode]);

  const ranking = useMemo(() => aggregateErrorRanking(filteredEvents), [filteredEvents]);
  const byClient = useMemo(
    () => aggregateErrorsByClient(filteredEvents, phoneMap),
    [filteredEvents, phoneMap]
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

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Erros de disparo</h2>
          <ErrorFilters
            rangeDays={rangeDays}
            onRangeChange={setRangeDays}
            clientOptions={clientOptions}
            clientId={clientId}
            onClientChange={setClientId}
            phoneOptions={phoneOptions}
            phoneId={phoneId}
            onPhoneChange={setPhoneId}
            errorCodeOptions={errorCodeOptions}
            errorCode={errorCode}
            onErrorCodeChange={setErrorCode}
          />
        </div>

        {loading && events.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de erros por código</CardTitle>
                </CardHeader>
                <CardContent>
                  <ErrorRankingTable rows={ranking} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Falhas por cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <ErrorsByClientList rows={byClient} />
                </CardContent>
              </Card>

              <DeliveryBreakdown counts={statusCounts} />
            </div>

            <div className="lg:col-span-1">
              <FailuresFeed events={filteredEvents.slice(0, RECENT_FEED_LIMIT)} phoneMap={phoneMap} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
