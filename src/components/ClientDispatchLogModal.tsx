"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageStatusBadge } from "@/components/health-badges";
import { useClientDispatchLogs } from "@/hooks/useClientDispatchLogs";
import { groupEventsByDay, isSuccessEvent } from "@/lib/messageEvents";
import { exportRowsToCsv, exportRowsToXls, type ExportColumn } from "@/lib/export";
import { formatDateTime, orNd } from "@/lib/format";
import type { ClientGroup } from "@/lib/health";
import type { MessageEventRow } from "@/types/database";
import { Download, FileSpreadsheet, Loader2, Send } from "lucide-react";

function formatDay(day: string): string {
  try {
    return format(parseISO(day), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return day;
  }
}

export function ClientDispatchLogModal({
  group,
  onOpenChange,
}: {
  group: ClientGroup | null;
  onOpenChange: (open: boolean) => void;
}) {
  const metaIds = useMemo(
    () => (group ? group.phones.map((p) => p.meta_phone_number_id).filter(Boolean) : []),
    [group]
  );
  const { events, loading } = useClientDispatchLogs(metaIds);

  const [dayFilter, setDayFilter] = useState("ALL");
  const [numberFilter, setNumberFilter] = useState("ALL");

  const numberLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of group?.phones ?? []) map.set(p.meta_phone_number_id, p.display_number);
    return map;
  }, [group]);

  const dayGroups = useMemo(() => groupEventsByDay(events), [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (dayFilter !== "ALL" && e.event_ts.slice(0, 10) !== dayFilter) return false;
      if (numberFilter !== "ALL" && e.phone_number_id !== numberFilter) return false;
      return true;
    });
  }, [events, dayFilter, numberFilter]);

  const successCount = filteredEvents.filter(isSuccessEvent).length;
  const errorCount = filteredEvents.length - successCount;

  const exportColumns: ExportColumn<MessageEventRow>[] = useMemo(
    () => [
      { header: "Data/hora", value: (e) => formatDateTime(e.event_ts) },
      { header: "Número", value: (e) => numberLabel.get(e.phone_number_id) ?? e.phone_number_id },
      { header: "Status", value: (e) => e.status },
      { header: "Código de erro", value: (e) => e.error_code ?? "" },
      { header: "Descrição do erro", value: (e) => e.error_title ?? "" },
      { header: "Detalhes", value: (e) => e.error_details ?? "" },
      { header: "Destinatário", value: (e) => e.recipient_masked ?? "" },
      { header: "Categoria", value: (e) => e.conversation_category ?? "" },
    ],
    [numberLabel]
  );

  const exportFilename = `disparos_${(group?.client_name ?? "cliente")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")}${dayFilter === "ALL" ? "" : `_${dayFilter}`}`;

  return (
    <Dialog
      open={group !== null}
      onOpenChange={(open) => {
        if (!open) {
          setDayFilter("ALL");
          setNumberFilter("ALL");
        }
        onOpenChange(open);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {group && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="size-4" />
                Disparos — {group.client_name}
              </DialogTitle>
              <DialogDescription>
                {group.phones.length} {group.phones.length === 1 ? "número" : "números"}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select
                  value={numberFilter}
                  onValueChange={(v) => setNumberFilter(v ?? "ALL")}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Número" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os números</SelectItem>
                    {group.phones.map((p) => (
                      <SelectItem key={p.phone_id} value={p.meta_phone_number_id}>
                        {p.display_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dayFilter} onValueChange={(v) => setDayFilter(v ?? "ALL")}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Dia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os dias</SelectItem>
                    {dayGroups.map((g) => (
                      <SelectItem key={g.day} value={g.day}>
                        {formatDay(g.day)} ({g.events.length})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filteredEvents.length === 0}
                  onClick={() =>
                    exportRowsToCsv(`${exportFilename}.csv`, filteredEvents, exportColumns)
                  }
                >
                  <Download className="size-3.5" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filteredEvents.length === 0}
                  onClick={() =>
                    exportRowsToXls(`${exportFilename}.xls`, filteredEvents, exportColumns)
                  }
                >
                  <FileSpreadsheet className="size-3.5" />
                  Excel
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-muted/30 px-4 py-2 text-sm">
              <span className="text-muted-foreground">
                {filteredEvents.length} {filteredEvents.length === 1 ? "registro" : "registros"}
              </span>
              <span className="font-medium text-emerald-700 dark:text-status-good">
                {successCount} sucesso
              </span>
              <span className="font-medium text-status-critical">
                {errorCount} {errorCount === 1 ? "erro" : "erros"}
              </span>
            </div>

            {loading ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum log de disparo registrado para este cliente.
              </p>
            ) : (
              <ScrollArea className="h-[380px]">
                <ul className="space-y-2 pr-3">
                  {filteredEvents.map((event) => (
                    <li
                      key={event.id}
                      className="flex items-start justify-between gap-3 border-b pb-2 text-sm last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {numberLabel.get(event.phone_number_id) ?? "Número não identificado"}
                          <span className="text-muted-foreground">
                            {" "}
                            · {orNd(event.recipient_masked)}
                          </span>
                        </p>
                        {!isSuccessEvent(event) && (
                          <p className="truncate text-xs text-muted-foreground">
                            {orNd(event.error_title)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/70">
                          {formatDateTime(event.event_ts)}
                          {event.conversation_category ? ` · ${event.conversation_category}` : ""}
                        </p>
                      </div>
                      <MessageStatusBadge event={event} />
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
