import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ClientGroup } from "@/lib/health";
import { Send } from "lucide-react";

export function ClientLogList({
  groups,
  onOpenLog,
}: {
  groups: ClientGroup[];
  onOpenLog: (group: ClientGroup) => void;
}) {
  if (groups.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhum cliente encontrado.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <Card key={group.client_id}>
          <CardContent className="flex items-center justify-between gap-3 py-1">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{group.client_name}</p>
              <p className="text-xs text-muted-foreground">
                {group.phones.length} {group.phones.length === 1 ? "número" : "números"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onOpenLog(group)}>
              <Send className="size-3.5" />
              Ver logs
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
