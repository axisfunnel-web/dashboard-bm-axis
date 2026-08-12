import type { BmUsageTodayRow } from "@/types/database";

const TIER_MAP: Record<string, number> = {
  TIER_250: 250,
  TIER_1K: 1000,
  TIER_2K: 2000,
  TIER_10K: 10000,
  TIER_50K: 50000,
  TIER_100K: 100000,
};

/** Converts a messaging_limit tier (or a raw numeric string / "UNLIMITED") to a numeric cap. Infinity for unlimited, null if unparseable. */
export function tierParaNumero(v: string | null | undefined): number | null {
  if (v == null) return null;
  const s = String(v).toUpperCase().trim();
  if (s in TIER_MAP) return TIER_MAP[s];
  if (s === "TIER_UNLIMITED" || s === "UNLIMITED") return Infinity;
  const n = Number(s.replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export type LimitRole = "good" | "warning" | "critical" | "neutral";

/** green <70%, amber 70-90%, red >90% (also red/full on overflow); neutral when there's no numeric cap */
export function limitRole(sent: number, limit: number | null): LimitRole {
  if (limit === null || limit === Infinity || limit <= 0) return "neutral";
  const ratio = sent / limit;
  if (ratio > 0.9) return "critical";
  if (ratio >= 0.7) return "warning";
  return "good";
}

/** Raw percentage (can exceed 100 on overflow); null when there's no numeric cap */
export function limitPercentLabel(sent: number, limit: number | null): string | null {
  if (limit === null || limit === Infinity || limit <= 0) return null;
  return `${Math.round((sent / limit) * 100)}%`;
}

/** Bar fill width, clamped to 100 so it reads as "full" on overflow instead of overflowing the track */
export function limitBarWidthPercent(sent: number, limit: number | null): number {
  if (limit === null || limit === Infinity || limit <= 0) return 0;
  return Math.min((sent / limit) * 100, 100);
}

export interface ClientLimitGroup {
  client_name: string;
  bms: BmUsageTodayRow[];
}

export function groupUsageByClient(rows: BmUsageTodayRow[]): ClientLimitGroup[] {
  const map = new Map<string, BmUsageTodayRow[]>();
  for (const row of rows) {
    const arr = map.get(row.client_name) ?? [];
    arr.push(row);
    map.set(row.client_name, arr);
  }
  return Array.from(map.entries())
    .map(([client_name, bms]) => ({ client_name, bms }))
    .sort((a, b) => a.client_name.localeCompare(b.client_name));
}
