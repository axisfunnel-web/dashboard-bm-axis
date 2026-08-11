import type { PhoneMeta } from "@/lib/dispatch";
import type { MessageEventRow } from "@/types/database";

export function isFailureEvent(e: MessageEventRow): boolean {
  return e.status === "failed" || e.error_code !== null;
}

export interface ErrorRankingRow {
  key: string;
  error_code: number | null;
  error_title: string | null;
  count: number;
  lastOccurrence: string;
}

/** Groups failed/error message_events by error_code, worst (most frequent) first */
export function aggregateErrorRanking(events: MessageEventRow[]): ErrorRankingRow[] {
  const map = new Map<string, ErrorRankingRow>();
  for (const e of events) {
    const key = e.error_code !== null ? String(e.error_code) : "sem_codigo";
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      if (e.event_ts > existing.lastOccurrence) existing.lastOccurrence = e.event_ts;
      if (!existing.error_title && e.error_title) existing.error_title = e.error_title;
    } else {
      map.set(key, {
        key,
        error_code: e.error_code,
        error_title: e.error_title,
        count: 1,
        lastOccurrence: e.event_ts,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export interface ClientErrorSummary {
  client_id: string;
  client_name: string;
  count: number;
}

/** Counts failed/error message_events per client, worst first */
export function aggregateErrorsByClient(
  events: MessageEventRow[],
  phoneMap: Map<string, PhoneMeta>
): ClientErrorSummary[] {
  const map = new Map<string, ClientErrorSummary>();
  for (const e of events) {
    const meta = phoneMap.get(e.phone_number_id);
    if (!meta) continue;
    const existing = map.get(meta.client_id);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(meta.client_id, {
        client_id: meta.client_id,
        client_name: meta.client_name,
        count: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
