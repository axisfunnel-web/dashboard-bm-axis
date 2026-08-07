"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUALITY_LABELS, STATUS_LABELS } from "@/lib/health";
import type { PhoneStatus, QualityRating } from "@/types/database";
import { Search } from "lucide-react";

export type QualityFilter = QualityRating | "ALL";
export type StatusFilter = PhoneStatus | "ALL";

interface FiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  quality: QualityFilter;
  onQualityChange: (value: QualityFilter) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
}

export function Filters({
  search,
  onSearchChange,
  quality,
  onQualityChange,
  status,
  onStatusChange,
}: FiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por cliente ou número..."
          className="pl-8"
        />
      </div>

      <Select value={quality} onValueChange={(v) => onQualityChange(v as QualityFilter)}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Qualidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todas as qualidades</SelectItem>
          {(Object.keys(QUALITY_LABELS) as QualityRating[]).map((q) => (
            <SelectItem key={q} value={q}>
              {QUALITY_LABELS[q]} ({q})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os status</SelectItem>
          {(Object.keys(STATUS_LABELS) as PhoneStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
