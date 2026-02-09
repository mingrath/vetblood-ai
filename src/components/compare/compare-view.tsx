"use client";

import { useState, useMemo, Fragment } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { GitCompareArrows, Calendar, AlertCircle } from "lucide-react";

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

interface TestResult {
  id: string;
  value: number | null;
  valueText: string | null;
  flag: string | null;
  parameter: Parameter;
}

interface BloodTest {
  id: string;
  testDate: Date;
  labName: string | null;
  testResults: TestResult[];
}

interface Patient {
  id: string;
  name: string;
  species: string;
  bloodTests: BloodTest[];
}

interface CompareViewProps {
  patient: Patient;
  parameters: Parameter[];
}

function getRefRange(
  param: Parameter,
  species: string
): { min: number | null; max: number | null } {
  if (species === "CAT") {
    return { min: param.catRefMin, max: param.catRefMax };
  }
  return { min: param.dogRefMin, max: param.dogRefMax };
}

function getFlag(
  value: number | null,
  refMin: number | null,
  refMax: number | null
): "LOW" | "NORMAL" | "HIGH" | null {
  if (value == null || refMin == null || refMax == null) return null;
  if (value < refMin) return "LOW";
  if (value > refMax) return "HIGH";
  return "NORMAL";
}

function getFlagStyle(flag: string | null): string {
  switch (flag) {
    case "LOW":
      return "text-blue-600 font-semibold";
    case "HIGH":
      return "text-red-600 font-semibold";
    case "NORMAL":
      return "text-green-600";
    default:
      return "text-foreground";
  }
}

function getFlagBgStyle(flag: string | null): string {
  switch (flag) {
    case "LOW":
      return "bg-blue-50";
    case "HIGH":
      return "bg-red-50";
    case "NORMAL":
      return "";
    default:
      return "";
  }
}

/** Determine if a change is improving toward normal or worsening away. */
function getDeltaInfo(
  prevValue: number | null,
  currValue: number | null,
  refMin: number | null,
  refMax: number | null
): { arrow: string; color: string } | null {
  if (prevValue == null || currValue == null) return null;
  if (refMin == null || refMax == null) return null;
  if (prevValue === currValue) return null;

  const refMid = (refMin + refMax) / 2;
  const prevDist = Math.abs(prevValue - refMid);
  const currDist = Math.abs(currValue - refMid);

  const improving = currDist < prevDist;
  const increasing = currValue > prevValue;

  return {
    arrow: increasing ? "\u2191" : "\u2193",
    color: improving ? "text-green-600" : "text-red-500",
  };
}

export function CompareView({ patient, parameters }: CompareViewProps) {
  const tests = patient.bloodTests;
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>(() => {
    // Default: select up to first 3 tests
    return tests.slice(0, Math.min(3, tests.length)).map((t) => t.id);
  });

  const selectedTests = useMemo(() => {
    return tests
      .filter((t) => selectedTestIds.includes(t.id))
      .sort(
        (a, b) =>
          new Date(a.testDate).getTime() - new Date(b.testDate).getTime()
      );
  }, [tests, selectedTestIds]);

  // Build a map of testId -> parameterId -> TestResult
  const resultMap = useMemo(() => {
    const map: Record<string, Record<string, TestResult>> = {};
    for (const test of selectedTests) {
      map[test.id] = {};
      for (const result of test.testResults) {
        map[test.id][result.parameter.id] = result;
      }
    }
    return map;
  }, [selectedTests]);

  // Get all quantitative parameters that appear in any selected test
  const quantitativeParams = useMemo(() => {
    return parameters.filter((p) => !p.isQualitative);
  }, [parameters]);

  // Get qualitative parameters that appear in any selected test
  const qualitativeParams = useMemo(() => {
    return parameters.filter((p) => p.isQualitative);
  }, [parameters]);

  // Get parameters that have data in at least one selected test
  const activeQuantParams = useMemo(() => {
    const paramIds = new Set<string>();
    for (const test of selectedTests) {
      for (const r of test.testResults) {
        if (!r.parameter.isQualitative && r.value != null) {
          paramIds.add(r.parameter.id);
        }
      }
    }
    return quantitativeParams.filter((p) => paramIds.has(p.id));
  }, [selectedTests, quantitativeParams]);

  const activeQualParams = useMemo(() => {
    const paramIds = new Set<string>();
    for (const test of selectedTests) {
      for (const r of test.testResults) {
        if (r.parameter.isQualitative) {
          paramIds.add(r.parameter.id);
        }
      }
    }
    return qualitativeParams.filter((p) => paramIds.has(p.id));
  }, [selectedTests, qualitativeParams]);

  // Group active quantitative params by category
  const paramsByCategory = useMemo(() => {
    return activeQuantParams.reduce<Record<string, Parameter[]>>((acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    }, {});
  }, [activeQuantParams]);

  const categoryOrder = ["HEMATOLOGY", "CHEMISTRY", "PARASITOLOGY"];
  const sortedCategories = Object.keys(paramsByCategory).sort(
    (a, b) =>
      (categoryOrder.indexOf(a) === -1 ? 999 : categoryOrder.indexOf(a)) -
      (categoryOrder.indexOf(b) === -1 ? 999 : categoryOrder.indexOf(b))
  );

  function toggleTest(testId: string) {
    setSelectedTestIds((prev) => {
      if (prev.includes(testId)) {
        return prev.filter((id) => id !== testId);
      }
      if (prev.length >= 5) return prev; // Max 5
      return [...prev, testId];
    });
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

  if (tests.length < 2) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="size-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">Not enough tests</h3>
          <p className="text-muted-foreground mt-1">
            At least 2 blood tests are needed for comparison.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Date Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="size-5" />
              Select Tests to Compare
            </CardTitle>
            <Badge variant="outline">
              {selectedTestIds.length} of {tests.length} selected (2-5)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tests.map((test) => {
              const isSelected = selectedTestIds.includes(test.id);
              const canSelect = isSelected || selectedTestIds.length < 5;
              const canDeselect = isSelected && selectedTestIds.length > 2;
              const disabled = !isSelected && !canSelect;

              return (
                <button
                  key={test.id}
                  onClick={() => {
                    if (isSelected && !canDeselect) return;
                    if (!isSelected && !canSelect) return;
                    toggleTest(test.id);
                  }}
                  disabled={disabled}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : disabled
                        ? "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        : "border-border bg-background text-foreground hover:bg-muted cursor-pointer"
                  } ${isSelected && !canDeselect ? "cursor-default" : ""}`}
                >
                  <Calendar className="size-3.5" />
                  {format(new Date(test.testDate), "MMM d, yyyy")}
                  {test.labName && (
                    <span className="opacity-60">- {test.labName}</span>
                  )}
                  <span className="opacity-60">
                    ({test.testResults.length} results)
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedTests.length >= 2 && activeQuantParams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GitCompareArrows className="size-5" />
              Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[180px]">
                      Parameter
                    </TableHead>
                    <TableHead className="min-w-[100px]">Ref. Range</TableHead>
                    {selectedTests.map((test, idx) => (
                      <TableHead key={test.id} className="min-w-[120px]">
                        <div className="flex flex-col">
                          <span>
                            {format(new Date(test.testDate), "MMM d, yyyy")}
                          </span>
                          {idx > 0 && (
                            <span className="text-xs font-normal text-muted-foreground">
                              vs prev
                            </span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCategories.map((category) => (
                    <Fragment key={category}>
                      {/* Category header row */}
                      <TableRow>
                        <TableCell
                          colSpan={selectedTests.length + 2}
                          className="bg-muted/50 font-semibold text-sm"
                        >
                          {getCategoryLabel(category)}
                        </TableCell>
                      </TableRow>
                      {paramsByCategory[category].map((param) => {
                        const ref = getRefRange(param, patient.species);
                        return (
                          <TableRow key={param.id}>
                            <TableCell className="sticky left-0 bg-background z-10 font-medium">
                              <div>
                                <span>{param.name}</span>
                                {param.unit && (
                                  <span className="text-muted-foreground ml-1 text-xs">
                                    ({param.unit})
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {ref.min != null && ref.max != null
                                ? `${ref.min} - ${ref.max}`
                                : "-"}
                            </TableCell>
                            {selectedTests.map((test, idx) => {
                              const result = resultMap[test.id]?.[param.id];
                              const prevTest =
                                idx > 0 ? selectedTests[idx - 1] : null;
                              const prevResult = prevTest
                                ? resultMap[prevTest.id]?.[param.id]
                                : null;

                              const value = result?.value ?? null;
                              const prevValue = prevResult?.value ?? null;
                              const flag = result?.flag || getFlag(value, ref.min, ref.max);
                              const delta = getDeltaInfo(
                                prevValue,
                                value,
                                ref.min,
                                ref.max
                              );

                              return (
                                <TableCell
                                  key={test.id}
                                  className={getFlagBgStyle(flag)}
                                >
                                  {value != null ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className={getFlagStyle(flag)}>
                                        {value}
                                      </span>
                                      {delta && (
                                        <span
                                          className={`text-xs font-bold ${delta.color}`}
                                        >
                                          {delta.arrow}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">
                                      -
                                    </span>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Qualitative Parameters Section */}
      {activeQualParams.length > 0 && selectedTests.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Qualitative Results</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[180px]">
                      Parameter
                    </TableHead>
                    {selectedTests.map((test) => (
                      <TableHead key={test.id} className="min-w-[120px]">
                        {format(new Date(test.testDate), "MMM d, yyyy")}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeQualParams.map((param) => (
                    <TableRow key={param.id}>
                      <TableCell className="sticky left-0 bg-background z-10 font-medium">
                        {param.name}
                      </TableCell>
                      {selectedTests.map((test) => {
                        const result = resultMap[test.id]?.[param.id];
                        return (
                          <TableCell key={test.id}>
                            {result?.valueText || result?.value != null ? (
                              <span className="text-sm">
                                {result.valueText || String(result.value)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                -
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-sm bg-blue-50 border border-blue-200" />
          <span className="text-blue-600 font-medium">Low</span> = Below
          reference
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-sm bg-green-50 border border-green-200" />
          <span className="text-green-600 font-medium">Normal</span> = Within
          reference
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-sm bg-red-50 border border-red-200" />
          <span className="text-red-600 font-medium">High</span> = Above
          reference
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-1.5">
          <span className="text-green-600 font-bold">{"\u2191\u2193"}</span> =
          Improving toward normal
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-red-500 font-bold">{"\u2191\u2193"}</span> =
          Moving away from normal
        </div>
      </div>
    </div>
  );
}
