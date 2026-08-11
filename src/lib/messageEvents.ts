import type { MessageEventRow, MessageStatus } from "@/types/database";

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  sent: "Enviada",
  delivered: "Entregue",
  read: "Lida",
  failed: "Falhou",
};

export function isSuccessEvent(e: MessageEventRow): boolean {
  return e.status !== "failed" && e.error_code === null;
}

export interface DayLogGroup {
  day: string;
  events: MessageEventRow[];
  successCount: number;
  errorCount: number;
}

/** Groups message_events by calendar day (event_ts), most recent day first */
export function groupEventsByDay(events: MessageEventRow[]): DayLogGroup[] {
  const map = new Map<string, MessageEventRow[]>();
  for (const e of events) {
    const day = e.event_ts.slice(0, 10);
    const arr = map.get(day) ?? [];
    arr.push(e);
    map.set(day, arr);
  }
  return Array.from(map.entries())
    .map(([day, dayEvents]) => ({
      day,
      events: dayEvents,
      successCount: dayEvents.filter(isSuccessEvent).length,
      errorCount: dayEvents.filter((e) => !isSuccessEvent(e)).length,
    }))
    .sort((a, b) => b.day.localeCompare(a.day));
}
