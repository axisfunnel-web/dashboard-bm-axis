"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { HealthEventRow, PhoneHealthRow } from "@/types/database";

const REFRESH_INTERVAL_MS = 25_000;
const ALERTS_LIMIT = 50;

interface DashboardData {
  phones: PhoneHealthRow[];
  alerts: HealthEventRow[];
  critical24hCount: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useDashboardData(): DashboardData {
  const supabase = useRef(createClient()).current;
  const [phones, setPhones] = useState<PhoneHealthRow[]>([]);
  const [alerts, setAlerts] = useState<HealthEventRow[]>([]);
  const [critical24hCount, setCritical24hCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const since24h = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString();

      const [phonesRes, alertsRes, criticalRes] = await Promise.all([
        supabase.from("v_phone_health").select("*").order("client_name"),
        supabase
          .from("health_events")
          .select("*")
          .in("severity", ["warning", "critical"])
          .order("created_at", { ascending: false })
          .limit(ALERTS_LIMIT),
        supabase
          .from("health_events")
          .select("*", { count: "exact", head: true })
          .eq("severity", "critical")
          .gte("created_at", since24h),
      ]);

      if (phonesRes.error) throw phonesRes.error;
      if (alertsRes.error) throw alertsRes.error;
      if (criticalRes.error) throw criticalRes.error;

      setPhones(phonesRes.data ?? []);
      setAlerts(alertsRes.data ?? []);
      setCritical24hCount(criticalRes.count ?? 0);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar dados."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  return {
    phones,
    alerts,
    critical24hCount,
    loading,
    error,
    lastUpdated,
    refresh: fetchAll,
  };
}
