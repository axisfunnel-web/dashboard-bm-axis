"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QualityBadge, SeverityBadge, StatusBadge } from "@/components/health-badges";
import { QualityTrendChart } from "@/components/QualityTrendChart";
import { formatDateTime, formatRelative, orNd } from "@/lib/format";
import { usePhoneEvents } from "@/hooks/usePhoneEvents";
import type { PhoneHealthRow } from "@/types/database";
import { Loader2 } from "lucide-react";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium">{value}</dd>
    </div>
  );
}

function payloadSummary(payload: Record<string, unknown> | null): string | null {
  if (!payload) return null;
  const parts: string[] = [];
  if (payload.quality) parts.push(`qualidade: ${payload.quality}`);
  if (payload.status) parts.push(`status: ${payload.status}`);
  if (payload.name_status) parts.push(`nome: ${payload.name_status}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function NumberDetailModal({
  phone,
  onOpenChange,
}: {
  phone: PhoneHealthRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { events, loading } = usePhoneEvents(phone?.phone_id ?? null);

  return (
    <Dialog open={phone !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {phone && (
          <>
            <DialogHeader>
              <DialogTitle>{phone.display_number}</DialogTitle>
              <DialogDescription>
                {orNd(phone.verified_name)} · {phone.client_name}
              </DialogDescription>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <QualityBadge quality={phone.quality_rating} />
                <StatusBadge status={phone.status} />
              </div>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-3">
              <InfoField label="Business Manager" value={orNd(phone.bm_name)} />
              <InfoField label="WABA" value={orNd(phone.waba_name)} />
              <InfoField
                label="Revisão da conta"
                value={orNd(phone.account_review_status)}
              />
              <InfoField
                label="Verificação do negócio"
                value={orNd(phone.business_verification_status)}
              />
              <InfoField
                label="Limite de mensagens"
                value={orNd(phone.messaging_limit)}
              />
              <InfoField
                label="Último evento"
                value={formatRelative(phone.last_event_at)}
              />
            </dl>

            <div>
              <h3 className="mb-2 text-sm font-semibold">Tendência de qualidade</h3>
              {loading ? (
                <div className="flex h-56 items-center justify-center text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : (
                <QualityTrendChart events={events} />
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">Eventos recentes</h3>
              {loading ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : events.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum evento registrado para este número.
                </p>
              ) : (
                <ul className="max-h-64 space-y-2 overflow-y-auto">
                  {[...events]
                    .reverse()
                    .map((event) => {
                      const summary = payloadSummary(event.payload);
                      return (
                        <li
                          key={event.id}
                          className="flex items-start justify-between gap-3 border-b pb-2 text-sm last:border-b-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {event.event_type}
                            </p>
                            {summary && (
                              <p className="truncate text-xs text-muted-foreground">
                                {summary}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground/70">
                              {formatDateTime(event.created_at)} · {event.source}
                            </p>
                          </div>
                          <SeverityBadge severity={event.severity} />
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
