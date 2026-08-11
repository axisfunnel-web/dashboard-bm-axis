"use client";

import { PeriodSelector } from "@/components/PeriodSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ErrorsRangeDays } from "@/hooks/useErrorsData";

export interface ErrorFilterOption {
  value: string;
  label: string;
}

export function ErrorFilters({
  rangeDays,
  onRangeChange,
  clientOptions,
  clientId,
  onClientChange,
  phoneOptions,
  phoneId,
  onPhoneChange,
  errorCodeOptions,
  errorCode,
  onErrorCodeChange,
}: {
  rangeDays: ErrorsRangeDays;
  onRangeChange: (v: ErrorsRangeDays) => void;
  clientOptions: ErrorFilterOption[];
  clientId: string;
  onClientChange: (v: string) => void;
  phoneOptions: ErrorFilterOption[];
  phoneId: string;
  onPhoneChange: (v: string) => void;
  errorCodeOptions: ErrorFilterOption[];
  errorCode: string;
  onErrorCodeChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <PeriodSelector value={rangeDays} onChange={onRangeChange} />

      <Select
        value={clientId}
        onValueChange={(v) => {
          onClientChange(v ?? "ALL");
          onPhoneChange("ALL");
        }}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os clientes</SelectItem>
          {clientOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={phoneId} onValueChange={(v) => onPhoneChange(v ?? "ALL")}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Número" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os números</SelectItem>
          {phoneOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={errorCode} onValueChange={(v) => onErrorCodeChange(v ?? "ALL")}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Código de erro" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os códigos</SelectItem>
          {errorCodeOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
