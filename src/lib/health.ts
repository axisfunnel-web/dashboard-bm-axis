import type {
  EventSeverity,
  HealthEventRow,
  PhoneHealthRow,
  PhoneStatus,
  QualityRating,
} from "@/types/database";

export const QUALITY_LABELS: Record<QualityRating, string> = {
  GREEN: "Alta",
  YELLOW: "Média",
  RED: "Baixa",
  UNKNOWN: "Desconhecida",
};

export const STATUS_LABELS: Record<PhoneStatus, string> = {
  CONNECTED: "Conectado",
  FLAGGED: "Sinalizado",
  RESTRICTED: "Restrito",
};

export const SEVERITY_LABELS: Record<EventSeverity, string> = {
  info: "Info",
  warning: "Atenção",
  critical: "Crítico",
};

/** Tailwind token role used by each quality rating (see globals.css status-* vars) */
export function qualityRole(
  quality: QualityRating
): "good" | "warning" | "critical" | "unknown" {
  switch (quality) {
    case "GREEN":
      return "good";
    case "YELLOW":
      return "warning";
    case "RED":
      return "critical";
    default:
      return "unknown";
  }
}

export function statusRole(
  status: PhoneStatus
): "good" | "warning" | "critical" {
  switch (status) {
    case "CONNECTED":
      return "good";
    case "FLAGGED":
      return "warning";
    case "RESTRICTED":
      return "critical";
  }
}

export function severityRole(
  severity: EventSeverity
): "unknown" | "warning" | "critical" {
  switch (severity) {
    case "critical":
      return "critical";
    case "warning":
      return "warning";
    default:
      return "unknown";
  }
}

/** Numeric rank used to sort "worst first" within a client / attention block */
export function phoneSeverityRank(row: PhoneHealthRow): number {
  if (row.status === "RESTRICTED") return 0;
  if (row.quality_rating === "RED") return 1;
  if (row.status === "FLAGGED") return 2;
  if (row.quality_rating === "YELLOW") return 3;
  if (row.quality_rating === "UNKNOWN") return 4;
  return 5; // GREEN + CONNECTED
}

/** O polling roda de hora em hora; 3h sem evento = o número saiu da atualização. */
export const STALE_AFTER_MS = 3 * 60 * 60 * 1000;

export function isPhoneStale(row: PhoneHealthRow, now: number = Date.now()): boolean {
  if (!row.last_event_at) return true;
  const t = new Date(row.last_event_at).getTime();
  if (Number.isNaN(t)) return true;
  return now - t > STALE_AFTER_MS;
}

export type MonitorRole = "good" | "warning" | "critical" | "unknown";

/** Estado geral de um número no Monitor: o pior entre qualidade, status e atualização. */
export function monitorRole(row: PhoneHealthRow, stale: boolean): MonitorRole {
  if (row.status === "RESTRICTED" || row.quality_rating === "RED") return "critical";
  if (row.status === "FLAGGED" || row.quality_rating === "YELLOW" || stale) return "warning";
  if (row.quality_rating === "UNKNOWN") return "unknown";
  return "good";
}

export function isPhoneProblematic(row: PhoneHealthRow): boolean {
  return (
    row.quality_rating === "RED" ||
    row.status === "FLAGGED" ||
    row.status === "RESTRICTED"
  );
}

export function sortPhonesBySeverity(rows: PhoneHealthRow[]): PhoneHealthRow[] {
  return [...rows].sort((a, b) => {
    const rankDiff = phoneSeverityRank(a) - phoneSeverityRank(b);
    if (rankDiff !== 0) return rankDiff;
    return a.display_number.localeCompare(b.display_number);
  });
}

export interface ClientGroup {
  client_id: string;
  client_name: string;
  phones: PhoneHealthRow[];
}

export function groupByClient(rows: PhoneHealthRow[]): ClientGroup[] {
  const map = new Map<string, ClientGroup>();
  for (const row of rows) {
    const existing = map.get(row.client_id);
    if (existing) {
      existing.phones.push(row);
    } else {
      map.set(row.client_id, {
        client_id: row.client_id,
        client_name: row.client_name,
        phones: [row],
      });
    }
  }
  const groups = Array.from(map.values());
  for (const g of groups) {
    g.phones = sortPhonesBySeverity(g.phones);
  }
  groups.sort((a, b) => {
    const aHasProblem = a.phones.some(isPhoneProblematic);
    const bHasProblem = b.phones.some(isPhoneProblematic);
    if (aHasProblem !== bHasProblem) return aHasProblem ? -1 : 1;
    return a.client_name.localeCompare(b.client_name);
  });
  return groups;
}

/** GREEN=3, YELLOW=2, RED=1, UNKNOWN=0 — for the quality trend chart */
export function qualityToNumber(quality: string | null | undefined): number {
  switch ((quality ?? "").toUpperCase()) {
    case "GREEN":
      return 3;
    case "YELLOW":
      return 2;
    case "RED":
      return 1;
    default:
      return 0;
  }
}

export interface OverviewStats {
  totalClients: number;
  totalBms: number;
  totalPhones: number;
  byQuality: Record<QualityRating, number>;
  problemCount: number;
}

export function computeOverviewStats(rows: PhoneHealthRow[]): OverviewStats {
  const clients = new Set<string>();
  const bms = new Set<string>();
  const byQuality: Record<QualityRating, number> = {
    GREEN: 0,
    YELLOW: 0,
    RED: 0,
    UNKNOWN: 0,
  };
  let problemCount = 0;

  for (const row of rows) {
    clients.add(row.client_id);
    if (row.bm_id) bms.add(row.bm_id);
    byQuality[row.quality_rating] = (byQuality[row.quality_rating] ?? 0) + 1;
    if (isPhoneProblematic(row)) problemCount += 1;
  }

  return {
    totalClients: clients.size,
    totalBms: bms.size,
    totalPhones: rows.length,
    byQuality,
    problemCount,
  };
}

/** Best-effort quality value for a health event: payload.quality, else inferred from event_type */
export function eventQualityValue(event: HealthEventRow): number {
  if (event.payload?.quality) {
    return qualityToNumber(event.payload.quality);
  }
  const type = event.event_type.toUpperCase();
  if (type.includes("GREEN")) return 3;
  if (type.includes("YELLOW")) return 2;
  if (type.includes("RED")) return 1;
  return qualityToNumber(undefined);
}
