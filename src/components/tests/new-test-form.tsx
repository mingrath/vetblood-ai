"use client";

import { useState, useTransition } from "react";
import { createBloodTest } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronRight,
  FlaskConical,
  Loader2,
  Save,
} from "lucide-react";
import { TestUploader } from "@/components/tests/test-uploader";

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

interface Patient {
  id: string;
  name: string;
  species: string;
}

interface NewTestFormProps {
  patient: Patient;
  parameters: Parameter[];
  hasApiKey?: boolean;
}

type ResultValue = {
  value: string;
  valueText: string;
};

type Flag = "LOW" | "NORMAL" | "HIGH" | null;

const CATEGORY_LABELS: Record<string, string> = {
  HEMATOLOGY: "Hematology",
  CHEMISTRY: "Chemistry",
  PARASITOLOGY: "Parasitology",
};

const CATEGORY_ORDER = ["HEMATOLOGY", "CHEMISTRY", "PARASITOLOGY"];

function getFlagBadgeClasses(flag: Flag) {
  switch (flag) {
    case "LOW":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "HIGH":
      return "bg-red-100 text-red-700 border-red-200";
    case "NORMAL":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "";
  }
}

export function NewTestForm({ patient, parameters, hasApiKey = false }: NewTestFormProps) {
  const [isPending, startTransition] = useTransition();
  const [testDate, setTestDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [labName, setLabName] = useState("");
  const [labNo, setLabNo] = useState("");
  const [notes, setNotes] = useState("");
  const [ocrMethod, setOcrMethod] = useState<string>("MANUAL");
  const [ocrRawText, setOcrRawText] = useState<string>("");

  // Track values for each parameter by ID
  const [results, setResults] = useState<Record<string, ResultValue>>({});

  // Track collapsed sections
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  // Group parameters by category
  const groupedParams = new Map<string, Parameter[]>();
  for (const param of parameters) {
    if (!groupedParams.has(param.category)) {
      groupedParams.set(param.category, []);
    }
    groupedParams.get(param.category)!.push(param);
  }

  const sortedCategories = CATEGORY_ORDER.filter((cat) =>
    groupedParams.has(cat)
  );

  function getRefRange(param: Parameter): { min: number | null; max: number | null } {
    const min = patient.species === "CAT" ? param.catRefMin : param.dogRefMin;
    const max = patient.species === "CAT" ? param.catRefMax : param.dogRefMax;
    return { min, max };
  }

  function getRefRangeDisplay(param: Parameter): string {
    const { min, max } = getRefRange(param);
    if (min == null && max == null) return "-";
    if (min != null && max != null) return `${min} - ${max}`;
    if (min != null) return `>= ${min}`;
    if (max != null) return `<= ${max}`;
    return "-";
  }

  function calculateFlag(param: Parameter, valueStr: string): Flag {
    if (param.isQualitative) return null;
    const numVal = parseFloat(valueStr);
    if (isNaN(numVal)) return null;

    const { min, max } = getRefRange(param);
    if (min == null || max == null) return null;
    if (numVal < min) return "LOW";
    if (numVal > max) return "HIGH";
    return "NORMAL";
  }

  function updateResult(paramId: string, field: "value" | "valueText", val: string) {
    setResults((prev) => ({
      ...prev,
      [paramId]: {
        ...prev[paramId],
        value: prev[paramId]?.value ?? "",
        valueText: prev[paramId]?.valueText ?? "",
        [field]: val,
      },
    }));
  }

  function toggleSection(category: string) {
    setCollapsedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }

  function handleSubmit() {
    startTransition(async () => {
      const resultEntries = Object.entries(results)
        .filter(([, r]) => r.value.trim() !== "" || r.valueText.trim() !== "")
        .map(([paramId, r]) => {
          const param = parameters.find((p) => p.id === paramId);
          return {
            parameterId: paramId,
            value: r.value.trim() !== "" ? parseFloat(r.value) : null,
            valueText: r.valueText.trim() !== "" ? r.valueText : null,
            unit: param?.unit || null,
          };
        });

      await createBloodTest({
        patientId: patient.id,
        testDate,
        labName: labName || undefined,
        labNo: labNo || undefined,
        notes: notes || undefined,
        ocrMethod,
        ocrRawText: ocrRawText || undefined,
        results: resultEntries,
      });
    });
  }

  function handleOcrComplete(values: Record<string, string>, rawText?: string) {
    if (rawText) setOcrRawText(rawText);
    setOcrMethod(rawText ? "TESSERACT" : "GEMINI");

    // Map OCR values (keyed by parameter code) to parameter IDs
    const newResults: Record<string, ResultValue> = { ...results };
    for (const param of parameters) {
      const val = values[param.code];
      if (val) {
        if (param.isQualitative) {
          newResults[param.id] = { value: "", valueText: val };
        } else {
          newResults[param.id] = { value: val, valueText: "" };
        }
      }
    }
    setResults(newResults);
  }

  // Count how many values have been entered
  const filledCount = Object.values(results).filter(
    (r) => r.value.trim() !== "" || r.valueText.trim() !== ""
  ).length;

  return (
    <div className="space-y-6">
      {/* OCR Upload */}
      <TestUploader onOcrComplete={handleOcrComplete} hasApiKey={hasApiKey} />

      {/* Test Info */}
      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="testDate">
                Test Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="testDate"
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labName">Lab Name</Label>
              <Input
                id="labName"
                placeholder="e.g. Central Vet Lab"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labNo">Lab Number</Label>
              <Input
                id="labNo"
                placeholder="e.g. LAB-2024-001"
                value={labNo}
                onChange={(e) => setLabNo(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                rows={1}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parameters by Category */}
      {sortedCategories.map((category) => {
        const params = groupedParams.get(category)!;
        const isCollapsed = collapsedSections[category] ?? false;

        // Count filled parameters in this category
        const categoryFilledCount = params.filter(
          (p) =>
            results[p.id] &&
            (results[p.id].value.trim() !== "" ||
              results[p.id].valueText.trim() !== "")
        ).length;

        return (
          <Card key={category}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => toggleSection(category)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FlaskConical className="size-5" />
                  {CATEGORY_LABELS[category] || category}
                  <Badge variant="outline" className="text-xs ml-2">
                    {params.length} parameters
                  </Badge>
                  {categoryFilledCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {categoryFilledCount} filled
                    </Badge>
                  )}
                </div>
                {isCollapsed ? (
                  <ChevronRight className="size-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
            {!isCollapsed && (
              <CardContent className="p-0">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-2 px-6 py-2 border-b bg-muted/50 text-sm font-medium text-muted-foreground">
                  <div className="col-span-4">Parameter</div>
                  <div className="col-span-3">Value</div>
                  <div className="col-span-2">Unit</div>
                  <div className="col-span-2">Reference</div>
                  <div className="col-span-1">Flag</div>
                </div>
                {/* Parameter rows */}
                <div className="divide-y">
                  {params.map((param) => {
                    const resultVal = results[param.id];
                    const currentValue = param.isQualitative
                      ? resultVal?.valueText ?? ""
                      : resultVal?.value ?? "";
                    const flag = param.isQualitative
                      ? null
                      : calculateFlag(param, currentValue);

                    return (
                      <div
                        key={param.id}
                        className={`grid grid-cols-12 gap-2 px-6 py-2.5 items-center text-sm ${
                          flag === "HIGH"
                            ? "bg-red-50/50"
                            : flag === "LOW"
                            ? "bg-blue-50/50"
                            : ""
                        }`}
                      >
                        {/* Parameter name */}
                        <div className="col-span-4">
                          <span className="font-medium">{param.name}</span>
                          {param.nameTh && (
                            <span className="text-muted-foreground text-xs ml-1">
                              ({param.nameTh})
                            </span>
                          )}
                        </div>

                        {/* Value input */}
                        <div className="col-span-3">
                          {param.isQualitative ? (
                            <Input
                              type="text"
                              placeholder="e.g. Negative"
                              className="h-8 text-sm"
                              value={resultVal?.valueText ?? ""}
                              onChange={(e) =>
                                updateResult(param.id, "valueText", e.target.value)
                              }
                            />
                          ) : (
                            <Input
                              type="number"
                              step="any"
                              placeholder="0.0"
                              className="h-8 text-sm"
                              value={resultVal?.value ?? ""}
                              onChange={(e) =>
                                updateResult(param.id, "value", e.target.value)
                              }
                            />
                          )}
                        </div>

                        {/* Unit */}
                        <div className="col-span-2 text-muted-foreground">
                          {param.unit || "-"}
                        </div>

                        {/* Reference range */}
                        <div className="col-span-2 text-muted-foreground text-xs">
                          {param.isQualitative
                            ? "-"
                            : getRefRangeDisplay(param)}
                        </div>

                        {/* Flag */}
                        <div className="col-span-1">
                          {flag && (
                            <Badge
                              className={`text-xs ${getFlagBadgeClasses(flag)}`}
                            >
                              {flag}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Submit */}
      <div className="flex items-center justify-between sticky bottom-0 bg-gray-50 py-4 border-t -mx-4 px-4 md:-mx-8 md:px-8">
        <p className="text-sm text-muted-foreground">
          {filledCount} {filledCount === 1 ? "parameter" : "parameters"} filled
        </p>
        <Button
          onClick={handleSubmit}
          disabled={isPending || !testDate || filledCount === 0}
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save Blood Test
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
