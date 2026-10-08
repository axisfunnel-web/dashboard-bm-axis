"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { HealthEventRow } from "@/types/database";

interface PhoneEvents {
  events: HealthEventRow[];
  loading: boolean;
  error: string | null;
}

interface FetchResult {
  id: string;
  events: HealthEventRow[];
  error: string | null;
}

export function usePhoneEvents(phoneId: string | null): PhoneEvents {
  const [result, setResult] = useState<FetchResult | null>(null);

  useEffect(() => {
    if (!phoneId) return;

    let cancelled = false;
    const supabase = createClient();

    supabase
      .from("health_events")
      .select("*")
      .eq("phone_number_id", phoneId)
      // Busca os 200 eventos MAIS RECENTES (desc) e devolve em ordem
      // cronológica (asc), que é o que o gráfico e a lista esperam.
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (cancelled) return;
        const events = (data ?? []).slice().reverse();
        setResult({ id: phoneId, events, error: error?.message ?? null });
      });

    return () => {
      cancelled = true;
    };
  }, [phoneId]);

  const isCurrent = phoneId !== null && result?.id === phoneId;

  return {
    events: isCurrent ? result!.events : [],
    loading: phoneId !== null && !isCurrent,
    error: isCurrent ? result!.error : null,
  };
}
