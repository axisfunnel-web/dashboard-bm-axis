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

export function orNd(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "n/d";
  return value;
}
