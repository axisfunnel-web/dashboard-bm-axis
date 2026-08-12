"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BmUsageLiveRow } from "@/types/database";

const REFRESH_INTERVAL_MS = 15_000;

interface UsageData {
  rows: BmUsageLiveRow[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useBmUsageLive(): UsageData {
  const supabase = useRef(createClient()).current;
  const [rows, setRows] = useState<BmUsageLiveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("v_bm_usage_live")
        .select("*")
        .order("client_name");

      if (error) throw error;

      setRows(data ?? []);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  return { rows, loading, error, lastUpdated, refresh: fetchAll };
}
