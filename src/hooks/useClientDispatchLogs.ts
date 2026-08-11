"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MessageEventRow } from "@/types/database";

const LOGS_LIMIT = 2000;

interface DispatchLogs {
  events: MessageEventRow[];
  loading: boolean;
  error: string | null;
}

interface FetchResult {
  key: string;
  events: MessageEventRow[];
  error: string | null;
}

/** Full success/error message_events history for every number of a client (by Meta's phone_number_id) */
export function useClientDispatchLogs(metaPhoneNumberIds: string[]): DispatchLogs {
  const key = [...metaPhoneNumberIds].sort().join(",");
  const [result, setResult] = useState<FetchResult | null>(null);

  useEffect(() => {
    if (metaPhoneNumberIds.length === 0) return;

    let cancelled = false;
    const supabase = createClient();

    supabase
      .from("message_events")
      .select("*")
      .in("phone_number_id", metaPhoneNumberIds)
      .order("event_ts", { ascending: false })
      .limit(LOGS_LIMIT)
      .then(({ data, error }) => {
        if (cancelled) return;
        setResult({ key, events: data ?? [], error: error?.message ?? null });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const isCurrent = metaPhoneNumberIds.length > 0 && result?.key === key;

  return {
    events: isCurrent ? result!.events : [],
    loading: metaPhoneNumberIds.length > 0 && !isCurrent,
    error: isCurrent ? result!.error : null,
  };
}
