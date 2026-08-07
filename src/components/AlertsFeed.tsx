import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SeverityBadge } from "@/components/health-badges";
import { formatRelative } from "@/lib/format";
import type { HealthEventRow, PhoneHealthRow } from "@/types/database";
import { Bell } from "lucide-react";

function payloadSummary(event: HealthEventRow): string | null {
  const p = event.payload;
  if (!p) return null;
  const parts: string[] = [];
  if (p.quality) parts.push(`qualidade: ${p.quality}`);
  if (p.status) parts.push(`status: ${p.status}`);
  if (p.name_status) parts.push(`nome: ${p.name_status}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function AlertsFeed({
  events,
  phonesById,
}: {
  events: HealthEventRow[];
  phonesById: Map<string, PhoneHealthRow>;
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-4" />
          Feed de alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 px-0">
        {events.length === 0 ? (
          <p className="px-6 text-sm text-muted-foreground">
            Nenhum alerta recente.
          </p>
        ) : (
          <ScrollArea className="h-[420px] px-6">
            <ul className="space-y-3">
              {events.map((event) => {
                const phone = phonesById.get(event.phone_number_id);
                const summary = payloadSummary(event);
                return (
                  <li
                    key={event.id}
                    className="border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <SeverityBadge severity={event.severity} />
                      <time className="text-xs text-muted-foreground">
                        {formatRelative(event.created_at)}
                      </time>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium">
                      {phone
                        ? `${phone.client_name} — ${phone.display_number}`
                        : "Número não identificado"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.event_type}
                      {summary ? ` · ${summary}` : ""}
                    </p>
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
