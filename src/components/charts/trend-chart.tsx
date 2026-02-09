"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Dot,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface TrendChartProps {
  parameterName: string;
  unit: string | null;
  data: Array<{ date: string; value: number }>;
  refMin: number | null;
  refMax: number | null;
  species: string;
}

function isInRange(
  value: number,
  refMin: number | null,
  refMax: number | null
): boolean {
  if (refMin == null || refMax == null) return true;
  return value >= refMin && value <= refMax;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: { date: string; value: number };
  refMin: number | null;
  refMax: number | null;
}

function CustomDot({ cx, cy, payload, refMin, refMax }: CustomDotProps) {
  if (cx == null || cy == null || !payload) return null;
  const inRange = isInRange(payload.value, refMin, refMax);
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={5}
      fill={inRange ? "#22c55e" : "#ef4444"}
      stroke={inRange ? "#16a34a" : "#dc2626"}
      strokeWidth={2}
    />
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: { date: string; value: number };
    value: number;
  }>;
  label?: string;
  unit: string | null;
  refMin: number | null;
  refMax: number | null;
}

function CustomTooltip({
  active,
  payload,
  unit,
  refMin,
  refMax,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0];
  const inRange = isInRange(data.value, refMin, refMax);
  const flag =
    refMin != null && refMax != null
      ? data.value < refMin
        ? "LOW"
        : data.value > refMax
          ? "HIGH"
          : "NORMAL"
      : null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-medium">{data.payload.date}</p>
      <p className="text-sm mt-1">
        <span className="font-semibold">
          {data.value}
          {unit ? ` ${unit}` : ""}
        </span>
      </p>
      {flag && (
        <p className="text-xs mt-1">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              inRange
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {inRange ? "Normal" : flag === "LOW" ? "Below range" : "Above range"}
          </span>
        </p>
      )}
      {refMin != null && refMax != null && (
        <p className="text-xs text-muted-foreground mt-1">
          Ref: {refMin} - {refMax}
          {unit ? ` ${unit}` : ""}
        </p>
      )}
    </div>
  );
}

export function TrendChart({
  parameterName,
  unit,
  data,
  refMin,
  refMax,
}: TrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="size-4" />
            {parameterName}
            {unit && (
              <span className="text-sm font-normal text-muted-foreground">
                ({unit})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate Y-axis domain with padding
  const values = data.map((d) => d.value);
  const allValues = [...values];
  if (refMin != null) allValues.push(refMin);
  if (refMax != null) allValues.push(refMax);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = (maxVal - minVal) * 0.15 || 1;
  const yMin = Math.max(0, minVal - padding);
  const yMax = maxVal + padding;

  // Check latest value status
  const latestValue = data[data.length - 1].value;
  const latestInRange = isInRange(latestValue, refMin, refMax);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="size-4" />
            {parameterName}
            {unit && (
              <span className="text-sm font-normal text-muted-foreground">
                ({unit})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {refMin != null && refMax != null && (
              <span className="text-xs text-muted-foreground">
                Ref: {refMin}-{refMax}
              </span>
            )}
            <Badge
              variant={latestInRange ? "outline" : "destructive"}
              className={
                latestInRange
                  ? "bg-green-50 text-green-700 border-green-200"
                  : ""
              }
            >
              Latest: {latestValue}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
                label={
                  unit
                    ? {
                        value: unit,
                        angle: -90,
                        position: "insideLeft",
                        style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
                      }
                    : undefined
                }
              />
              <Tooltip
                content={
                  <CustomTooltip unit={unit} refMin={refMin} refMax={refMax} />
                }
              />
              {refMin != null && refMax != null && (
                <ReferenceArea
                  y1={refMin}
                  y2={refMax}
                  fill="#22c55e"
                  fillOpacity={0.08}
                  stroke="#22c55e"
                  strokeOpacity={0.2}
                  strokeDasharray="3 3"
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={(props) => (
                  <CustomDot
                    key={props.index}
                    cx={props.cx}
                    cy={props.cy}
                    payload={props.payload}
                    refMin={refMin}
                    refMax={refMax}
                  />
                )}
                activeDot={{
                  r: 7,
                  stroke: "#3b82f6",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
