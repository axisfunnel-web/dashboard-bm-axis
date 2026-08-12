import { NumberCard } from "@/components/NumberCard";
import { sortPhonesBySeverity } from "@/lib/health";
import type { BmUsageLiveRow, PhoneHealthRow } from "@/types/database";
import { ShieldAlert } from "lucide-react";

export function AttentionBlock({
  phones,
  onSelectPhone,
  usageByBmId,
}: {
  phones: PhoneHealthRow[];
  onSelectPhone: (phone: PhoneHealthRow) => void;
  usageByBmId?: Map<string, BmUsageLiveRow>;
}) {
  if (phones.length === 0) return null;

  const sorted = sortPhonesBySeverity(phones);

  return (
    <section className="space-y-3 rounded-xl border border-status-critical/30 bg-status-critical-bg/60 p-4">
      <div className="flex items-center gap-2">
        <ShieldAlert className="size-5 text-status-critical" />
        <h2 className="text-lg font-semibold text-status-critical">
          Atenção — {sorted.length}{" "}
          {sorted.length === 1 ? "número" : "números"} com problema
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        {sorted.map((phone) => (
          <NumberCard
            key={phone.phone_id}
            phone={phone}
            onClick={() => onSelectPhone(phone)}
            usage={phone.bm_id ? usageByBmId?.get(phone.bm_id) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
