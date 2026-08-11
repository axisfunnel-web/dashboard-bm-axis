"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MessagingStatsRow, PhoneHealthRow } from "@/types/database";

const REFRESH_INTERVAL_MS = 25_000;

export type DispatchRangeDays = 7 | 30;

interface DispatchData {
  phones: PhoneHealthRow[];
  stats: MessagingStatsRow[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useDispatchData(rangeDays: DispatchRangeDays): DispatchData {
  const supabase = useRef(createClient()).current;
  const [phones, setPhones] = useState<PhoneHealthRow[]>([]);
  const [stats, setStats] = useState<MessagingStatsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const since = new Date();
      since.setDate(since.getDate() - (rangeDays - 1));
      const sinceDate = since.toISOString().slice(0, 10);

      const [phonesRes, statsRes] = await Promise.all([
        supabase.from("v_phone_health").select("*").order("client_name"),
        supabase
          .from("messaging_stats")
          .select("*")
          .gte("stat_date", sinceDate)
          .order("stat_date"),
      ]);

      if (phonesRes.error) throw phonesRes.error;
      if (statsRes.error) throw statsRes.error;

      setPhones(phonesRes.data ?? []);
      setStats(statsRes.data ?? []);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [supabase, rangeDays]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  return { phones, stats, loading, error, lastUpdated, refresh: fetchAll };
}
