import type { MessagingStatsRow, PhoneHealthRow } from "@/types/database";

export const LOW_DELIVERY_RATE_THRESHOLD = 0.9;

export interface PhoneMeta {
  client_id: string;
  client_name: string;
  display_number: string;
  bm_name: string | null;
}

/** Maps meta_phone_number_id -> client/number info, for joining messaging_stats/message_events to v_phone_health */
export function buildPhoneMetaMap(phones: PhoneHealthRow[]): Map<string, PhoneMeta> {
  const map = new Map<string, PhoneMeta>();
  for (const p of phones) {
    if (!p.meta_phone_number_id) continue;
    map.set(p.meta_phone_number_id, {
      client_id: p.client_id,
      client_name: p.client_name,
      display_number: p.display_number,
      bm_name: p.bm_name,
    });
  }
  return map;
}

export function deliveryRate(sent: number, delivered: number): number {
  if (sent <= 0) return 0;
  return delivered / sent;
}

export interface PhoneDispatchSummary {
  phone_number_id: string;
  display_number: string;
  sent: number;
  delivered: number;
  rate: number;
}

export interface ClientDispatchSummary {
  client_id: string;
  client_name: string;
  sent: number;
  delivered: number;
  rate: number;
  phones: PhoneDispatchSummary[];
}

/** Aggregates messaging_stats rows by client (and by phone within each client) */
export function aggregateByClient(
  stats: MessagingStatsRow[],
  phoneMap: Map<string, PhoneMeta>
): ClientDispatchSummary[] {
  const clients = new Map<string, ClientDispatchSummary>();
  const phoneAgg = new Map<string, { sent: number; delivered: number }>();

  for (const row of stats) {
    const meta = phoneMap.get(row.phone_number_id);
    if (!meta) continue;

    const pAgg = phoneAgg.get(row.phone_number_id) ?? { sent: 0, delivered: 0 };
    pAgg.sent += row.sent;
    pAgg.delivered += row.delivered;
    phoneAgg.set(row.phone_number_id, pAgg);

    const cAgg = clients.get(meta.client_id) ?? {
      client_id: meta.client_id,
      client_name: meta.client_name,
      sent: 0,
      delivered: 0,
      rate: 0,
      phones: [],
    };
    cAgg.sent += row.sent;
    cAgg.delivered += row.delivered;
    clients.set(meta.client_id, cAgg);
  }

  for (const [phoneId, agg] of phoneAgg) {
    const meta = phoneMap.get(phoneId);
    if (!meta) continue;
    const client = clients.get(meta.client_id);
    if (!client) continue;
    client.phones.push({
      phone_number_id: phoneId,
      display_number: meta.display_number,
      sent: agg.sent,
      delivered: agg.delivered,
      rate: deliveryRate(agg.sent, agg.delivered),
    });
  }

  const result = Array.from(clients.values());
  for (const c of result) {
    c.rate = deliveryRate(c.sent, c.delivered);
    c.phones.sort((a, b) => b.sent - a.sent);
  }
  result.sort((a, b) => b.sent - a.sent);
  return result;
}

export interface DailyDispatchPoint {
  date: string;
  sent: number;
  delivered: number;
}

/** Aggregates messaging_stats rows by day, optionally scoped to a client or a single phone */
export function aggregateByDay(
  stats: MessagingStatsRow[],
  phoneMap: Map<string, PhoneMeta>,
  scope?: { clientId?: string; phoneNumberId?: string }
): DailyDispatchPoint[] {
  const byDate = new Map<string, DailyDispatchPoint>();

  for (const row of stats) {
    if (scope?.phoneNumberId && row.phone_number_id !== scope.phoneNumberId) continue;
    if (scope?.clientId) {
      const meta = phoneMap.get(row.phone_number_id);
      if (!meta || meta.client_id !== scope.clientId) continue;
    }
    const existing = byDate.get(row.stat_date) ?? {
      date: row.stat_date,
      sent: 0,
      delivered: 0,
    };
    existing.sent += row.sent;
    existing.delivered += row.delivered;
    byDate.set(row.stat_date, existing);
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export interface DispatchTotals {
  sent: number;
  delivered: number;
  rate: number;
}

export function computeTotals(stats: MessagingStatsRow[]): DispatchTotals {
  let sent = 0;
  let delivered = 0;
  for (const row of stats) {
    sent += row.sent;
    delivered += row.delivered;
  }
  return { sent, delivered, rate: deliveryRate(sent, delivered) };
}
