import { NumberCard } from "@/components/NumberCard";
import { isPhoneProblematic, type ClientGroup } from "@/lib/health";
import type { PhoneHealthRow } from "@/types/database";
import { ShieldAlert } from "lucide-react";

export function ClientSection({
  group,
  onSelectPhone,
}: {
  group: ClientGroup;
  onSelectPhone: (phone: PhoneHealthRow) => void;
}) {
  const problemCount = group.phones.filter(isPhoneProblematic).length;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border/70 pb-2">
        <h2 className="text-lg font-semibold tracking-tight">{group.client_name}</h2>
        <span className="text-sm text-muted-foreground">
          ({group.phones.length} {group.phones.length === 1 ? "número" : "números"})
        </span>
        {problemCount > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-status-critical-bg px-2 py-0.5 text-xs font-medium text-status-critical">
            <ShieldAlert className="size-3.5" />
            {problemCount} com problema
          </span>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {group.phones.map((phone) => (
          <NumberCard
            key={phone.phone_id}
            phone={phone}
            onClick={() => onSelectPhone(phone)}
          />
        ))}
      </div>
    </section>
  );
}
