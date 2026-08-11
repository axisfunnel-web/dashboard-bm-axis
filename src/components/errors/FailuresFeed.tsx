import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime, orNd } from "@/lib/format";
import type { PhoneMeta } from "@/lib/dispatch";
import type { MessageEventRow } from "@/types/database";
import { AlertTriangle } from "lucide-react";

export function FailuresFeed({
  events,
  phoneMap,
}: {
  events: MessageEventRow[];
  phoneMap: Map<string, PhoneMeta>;
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-4" />
          Falhas recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 px-0">
        {events.length === 0 ? (
          <p className="px-6 text-sm text-muted-foreground">
            Nenhuma falha recente no período/filtros selecionados.
          </p>
        ) : (
          <ScrollArea className="h-[520px] px-6">
            <ul className="space-y-3">
              {events.map((event) => {
                const meta = phoneMap.get(event.phone_number_id);
                return (
                  <li key={event.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-status-critical-bg px-2 py-0.5 text-xs font-medium text-status-critical">
                        {event.error_code ?? event.status}
                      </span>
                      <time className="text-xs text-muted-foreground">
                        {formatDateTime(event.event_ts)}
                      </time>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium">
                      {meta ? `${meta.client_name} — ${meta.display_number}` : "Número não identificado"}
                      <span className="text-muted-foreground"> · {orNd(event.recipient_masked)}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {orNd(event.error_title)}
                    </p>
                    {event.error_details && (
                      <p className="truncate text-xs text-muted-foreground/80">
                        {event.error_details}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
