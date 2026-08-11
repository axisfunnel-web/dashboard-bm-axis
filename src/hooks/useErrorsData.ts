"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MessageEventRow, MessageStatus, PhoneHealthRow } from "@/types/database";

const REFRESH_INTERVAL_MS = 25_000;
const EVENTS_LIMIT = 1000;
const STATUSES: MessageStatus[] = ["sent", "delivered", "read", "failed"];

export type ErrorsRangeDays = 7 | 30;

export type StatusCounts = Record<MessageStatus, number>;

interface ErrorsData {
  phones: PhoneHealthRow[];
  events: MessageEventRow[];
  statusCounts: StatusCounts;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useErrorsData(rangeDays: ErrorsRangeDays): ErrorsData {
  const supabase = useRef(createClient()).current;
  const [phones, setPhones] = useState<PhoneHealthRow[]>([]);
  const [events, setEvents] = useState<MessageEventRow[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const since = new Date(
        Date.now() - rangeDays * 24 * 60 * 60 * 1000
      ).toISOString();

      const [phonesRes, eventsRes] = await Promise.all([
        supabase.from("v_phone_health").select("*").order("client_name"),
        supabase
          .from("message_events")
          .select("*")
          .or("status.eq.failed,error_code.not.is.null")
          .gte("event_ts", since)
          .order("event_ts", { ascending: false })
          .limit(EVENTS_LIMIT),
      ]);

      if (phonesRes.error) throw phonesRes.error;
      if (eventsRes.error) throw eventsRes.error;

      const countResults = await Promise.all(
        STATUSES.map((status) =>
          supabase
            .from("message_events")
            .select("*", { count: "exact", head: true })
            .eq("status", status)
            .gte("event_ts", since)
        )
      );

      const counts: StatusCounts = { sent: 0, delivered: 0, read: 0, failed: 0 };
      countResults.forEach((res, i) => {
        if (res.error) throw res.error;
        counts[STATUSES[i]] = res.count ?? 0;
      });

      setPhones(phonesRes.data ?? []);
      setEvents(eventsRes.data ?? []);
      setStatusCounts(counts);
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

  return { phones, events, statusCounts, loading, error, lastUpdated, refresh: fetchAll };
}
