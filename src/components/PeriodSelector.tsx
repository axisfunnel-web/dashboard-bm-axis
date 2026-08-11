"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PeriodSelector({
  value,
  onChange,
}: {
  value: 7 | 30;
  onChange: (value: 7 | 30) => void;
}) {
  return (
    <Select
      value={String(value)}
      onValueChange={(v) => onChange(Number(v) === 30 ? 30 : 7)}
    >
      <SelectTrigger className="w-full sm:w-40">
        <SelectValue placeholder="Período" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">Últimos 7 dias</SelectItem>
        <SelectItem value="30">Últimos 30 dias</SelectItem>
      </SelectContent>
    </Select>
  );
}
