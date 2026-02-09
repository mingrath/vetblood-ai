"use client";

import { useState, useEffect, useCallback } from "react";
import { getTrendData } from "@/app/actions";
import { TrendChart } from "./trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Loader2, BarChart3 } from "lucide-react";

interface Parameter {
  id: string;
  code: string;
  name: string;
  nameTh: string | null;
  category: string;
  unit: string | null;
  dogRefMin: number | null;
  dogRefMax: number | null;
  catRefMin: number | null;
  catRefMax: number | null;
  isQualitative: boolean;
  sortOrder: number;
}

interface BloodTest {
  id: string;
  testDate: Date;
  testResults: Array<{
    id: string;
    value: number | null;
    parameter: Parameter;
  }>;
}

interface Patient {
  id: string;
  name: string;
  species: string;
  bloodTests: BloodTest[];
}

interface TrendDataPoint {
  date: string;
  value: number;
}

interface ParameterTrendData {
  parameterId: string;
  parameterName: string;
  unit: string | null;
  refMin: number | null;
  refMax: number | null;
  data: TrendDataPoint[];
}

interface TrendViewProps {
  patient: Patient;
  parameters: Parameter[];
}

export function TrendView({ patient, parameters }: TrendViewProps) {
  const quantitativeParams = parameters.filter((p) => !p.isQualitative);

  // Group parameters by category
  const paramsByCategory = quantitativeParams.reduce<
    Record<string, Parameter[]>
  >((acc, param) => {
    if (!acc[param.category]) {
      acc[param.category] = [];
    }
    acc[param.category].push(param);
    return acc;
  }, {});

  const categoryOrder = ["HEMATOLOGY", "CHEMISTRY", "PARASITOLOGY"];
  const sortedCategories = Object.keys(paramsByCategory).sort(
    (a, b) =>
      (categoryOrder.indexOf(a) === -1 ? 999 : categoryOrder.indexOf(a)) -
      (categoryOrder.indexOf(b) === -1 ? 999 : categoryOrder.indexOf(b))
  );

  // Default: select first 4 non-qualitative parameters
  const defaultSelected = quantitativeParams.slice(0, 4).map((p) => p.id);
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelected);
  const [trendData, setTrendData] = useState<ParameterTrendData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrends = useCallback(async () => {
    if (selectedIds.length === 0) {
      setTrendData([]);
      return;
    }

    setLoading(true);
    try {
      const results = await getTrendData(patient.id, selectedIds);

      // Group results by parameter
      const grouped: Record<
        string,
        { param: Parameter; points: TrendDataPoint[] }
      > = {};

      for (const result of results) {
        const pid = result.parameter.id;
        if (!grouped[pid]) {
          grouped[pid] = {
            param: result.parameter,
            points: [],
          };
        }
        if (result.value != null) {
          grouped[pid].points.push({
            date: format(new Date(result.bloodTest.testDate), "MMM d, yyyy"),
            value: result.value,
          });
        }
      }

      const mapped: ParameterTrendData[] = selectedIds
        .map((id) => {
          const group = grouped[id];
          if (!group) {
            const param = parameters.find((p) => p.id === id);
            if (!param) return null;
            return {
              parameterId: id,
              parameterName: param.name,
              unit: param.unit,
              refMin:
                patient.species === "CAT"
                  ? param.catRefMin
                  : param.dogRefMin,
              refMax:
                patient.species === "CAT"
                  ? param.catRefMax
                  : param.dogRefMax,
              data: [],
            };
          }
          return {
            parameterId: id,
            parameterName: group.param.name,
            unit: group.param.unit,
            refMin:
              patient.species === "CAT"
                ? group.param.catRefMin
                : group.param.dogRefMin,
            refMax:
              patient.species === "CAT"
                ? group.param.catRefMax
                : group.param.dogRefMax,
            data: group.points,
          };
        })
        .filter((d): d is ParameterTrendData => d !== null);

      setTrendData(mapped);
    } catch (error) {
      console.error("Failed to fetch trend data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedIds, patient.id, patient.species, parameters]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  function toggleParameter(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelectedIds(quantitativeParams.map((p) => p.id));
  }

  function clearAll() {
    setSelectedIds([]);
  }

  function getCategoryLabel(category: string) {
    switch (category) {
      case "HEMATOLOGY":
        return "Hematology";
      case "CHEMISTRY":
        return "Chemistry";
      case "PARASITOLOGY":
        return "Parasitology";
      default:
        return category;
    }
  }

  return (
    <div className="space-y-6">
      {/* Parameter Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Select Parameters</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedIds.length} selected
              </Badge>
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedCategories.map((category) => (
            <div key={category}>
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                {getCategoryLabel(category)}
              </p>
              <div className="flex flex-wrap gap-2">
                {paramsByCategory[category].map((param) => {
                  const isSelected = selectedIds.includes(param.id);
                  return (
                    <button
                      key={param.id}
                      onClick={() => toggleParameter(param.id)}
                      className={`inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {param.name}
                      {param.unit && (
                        <span className="ml-1 opacity-60">({param.unit})</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {category !== sortedCategories[sortedCategories.length - 1] && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Charts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading trends...</span>
        </div>
      ) : selectedIds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="size-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">No parameters selected</h3>
            <p className="text-muted-foreground mt-1">
              Select one or more parameters above to view trends.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {trendData.map((trend) => (
            <TrendChart
              key={trend.parameterId}
              parameterName={trend.parameterName}
              unit={trend.unit}
              data={trend.data}
              refMin={trend.refMin}
              refMax={trend.refMax}
              species={patient.species}
            />
          ))}
        </div>
      )}
    </div>
  );
}
