"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LOW_DELIVERY_RATE_THRESHOLD, type ClientDispatchSummary } from "@/lib/dispatch";
import { formatCount, formatPercent } from "@/components/dispatch/DispatchSummaryCards";
import { ChevronDown } from "lucide-react";

function RateBadge({ rate, sent }: { rate: number; sent: number }) {
  const low = sent > 0 && rate < LOW_DELIVERY_RATE_THRESHOLD;
  return (
    <span
      className={cn(
        "tabular-nums rounded-full px-2 py-0.5 text-xs font-medium",
        low ? "bg-status-critical-bg text-status-critical" : "bg-status-good-bg text-emerald-700 dark:text-status-good"
      )}
    >
      {sent > 0 ? formatPercent(rate) : "n/d"}
    </span>
  );
}

export function ClientDispatchList({ clients }: { clients: ClientDispatchSummary[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (clients.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Sem dados de disparo no período selecionado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {clients.map((client) => {
        const open = openId === client.client_id;
        return (
          <Card key={client.client_id} className="overflow-hidden">
            <button
              onClick={() => setOpenId(open ? null : client.client_id)}
              className="flex w-full items-center gap-4 px-4 py-3 text-left"
            >
              <ChevronDown
                className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {client.client_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {client.phones.length} {client.phones.length === 1 ? "número" : "números"}
              </span>
              <span className="tabular-nums text-sm font-medium">{formatCount(client.sent)}</span>
              <span className="tabular-nums text-sm text-muted-foreground">
                {formatCount(client.delivered)} entregues
              </span>
              <RateBadge rate={client.rate} sent={client.sent} />
            </button>

            {open && (
              <CardContent className="border-t bg-muted/30 pt-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {client.phones.map((phone) => (
                    <div
                      key={phone.phone_number_id}
                      className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium tabular-nums">
                          {phone.display_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCount(phone.sent)} enviados · {formatCount(phone.delivered)} entregues
                        </p>
                      </div>
                      <RateBadge rate={phone.rate} sent={phone.sent} />
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
