import { BmLimitCard } from "@/components/limits/BmLimitCard";
import type { ClientLimitGroup } from "@/lib/limits";

export function ClientLimitsSection({ group }: { group: ClientLimitGroup }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border/70 pb-2">
        <h2 className="text-lg font-semibold tracking-tight">{group.client_name}</h2>
        <span className="text-sm text-muted-foreground">
          ({group.bms.length} {group.bms.length === 1 ? "BM" : "BMs"})
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {group.bms.map((bm) => (
          <BmLimitCard key={bm.bm_id} usage={bm} />
        ))}
      </div>
    </section>
  );
}
