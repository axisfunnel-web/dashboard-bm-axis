import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatRelative(dateStr: string | null): string {
  if (!dateStr) return "n/d";
  try {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return "n/d";
  }
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "n/d";
  try {
    return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return "n/d";
  }
}

/** "agora" for the first ~10s after a fetch, then falls back to the usual relative distance */
export function formatLiveUpdated(date: Date | null): string {
  if (!date) return "—";
  if (Date.now() - date.getTime() < 10_000) return "agora";
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
}

export function orNd(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "n/d";
  return value;
}
