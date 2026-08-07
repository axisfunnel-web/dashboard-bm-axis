"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDateTime } from "@/lib/format";
import { qualityToNumber } from "@/lib/health";
import type { HealthEventRow } from "@/types/database";

const QUALITY_TICK_LABELS: Record<number, string> = {
  0: "Desconhecida",
  1: "Baixa",
  2: "Média",
  3: "Alta",
};

interface TrendPoint {
  time: string;
  fullDate: string;
  value: number;
  quality: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TrendPoint }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="font-medium">{point.fullDate}</p>
      <p className="text-muted-foreground">
        Qualidade: {QUALITY_TICK_LABELS[point.value]}
      </p>
    </div>
  );
}

export function QualityTrendChart({ events }: { events: HealthEventRow[] }) {
  const data: TrendPoint[] = events
    .filter((e) => e.payload?.quality)
    .map((e) => ({
      time: formatDateTime(e.created_at),
      fullDate: formatDateTime(e.created_at),
      value: qualityToNumber(e.payload?.quality),
      quality: e.payload?.quality ?? "UNKNOWN",
    }));

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Sem histórico de qualidade registrado para este número.
      </p>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            minTickGap={24}
          />
          <YAxis
            domain={[0, 3]}
            ticks={[0, 1, 2, 3]}
            tickFormatter={(v: number) => QUALITY_TICK_LABELS[v] ?? ""}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            width={78}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
          />
          <Line
            type="stepAfter"
            dataKey="value"
            stroke="var(--color-chart-trend)"
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 0, fill: "var(--color-chart-trend)" }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
