import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getBloodTest } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteTestButton } from "@/components/tests/delete-test-button";
import {
  ArrowLeft,
  Calendar,
  Building2,
  Hash,
  ScanLine,
  FileText,
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  HEMATOLOGY: "Hematology",
  CHEMISTRY: "Chemistry",
  PARASITOLOGY: "Parasitology",
};

const CATEGORY_ORDER = ["HEMATOLOGY", "CHEMISTRY", "PARASITOLOGY"];

function getFlagBadgeClasses(flag: string | null) {
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

function getFlagRowClasses(flag: string | null) {
  switch (flag) {
    case "LOW":
      return "bg-blue-50/50";
    case "HIGH":
      return "bg-red-50/50";
    case "NORMAL":
      return "";
    default:
      return "";
  }
}

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ id: string; testId: string }>;
}) {
  const { id, testId } = await params;
  const testData = await getBloodTest(testId);

  if (!testData) {
    notFound();
  }

  const test = testData;

  // Group results by category
  const groupedResults = new Map<
    string,
    typeof test.testResults
  >();

  for (const result of test.testResults) {
    const category = result.parameter.category;
    if (!groupedResults.has(category)) {
      groupedResults.set(category, []);
    }
    groupedResults.get(category)!.push(result);
  }

  // Sort categories in the defined order
  const sortedCategories = CATEGORY_ORDER.filter((cat) =>
    groupedResults.has(cat)
  );

  // Count abnormal results
  const abnormalCount = test.testResults.filter(
    (r) => r.flag === "HIGH" || r.flag === "LOW"
  ).length;
  const totalResults = test.testResults.length;

  // Get reference range display based on patient species
  const species = test.patient.species;

  function getRefRange(param: typeof test.testResults[0]["parameter"]) {
    const min = species === "CAT" ? param.catRefMin : param.dogRefMin;
    const max = species === "CAT" ? param.catRefMax : param.dogRefMax;
    if (min == null && max == null) return "-";
    if (min != null && max != null) return `${min} - ${max}`;
    if (min != null) return `>= ${min}`;
    if (max != null) return `<= ${max}`;
    return "-";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/patients/${id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Blood Test Results
          </h1>
          <p className="text-muted-foreground">
            {test.patient.name} - {format(new Date(test.testDate), "MMMM d, yyyy")}
          </p>
        </div>
        <DeleteTestButton testId={test.id} patientId={id} />
      </div>

      {/* Test Info Card */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="font-medium">
                {format(new Date(test.testDate), "MMMM d, yyyy")}
              </span>
            </div>
            {test.labName && (
              <div className="flex items-center gap-1.5">
                <Building2 className="size-4 text-muted-foreground" />
                <span>{test.labName}</span>
              </div>
            )}
            {test.labNo && (
              <div className="flex items-center gap-1.5">
                <Hash className="size-4 text-muted-foreground" />
                <span>{test.labNo}</span>
              </div>
            )}
            {test.ocrMethod && (
              <div className="flex items-center gap-1.5">
                <ScanLine className="size-4 text-muted-foreground" />
                <Badge variant="secondary" className="text-xs">
                  {test.ocrMethod}
                </Badge>
              </div>
            )}
            <Separator orientation="vertical" className="h-5 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {totalResults} {totalResults === 1 ? "result" : "results"}
              </Badge>
              {abnormalCount > 0 ? (
                <Badge variant="destructive" className="text-xs">
                  {abnormalCount} abnormal
                </Badge>
              ) : (
                totalResults > 0 && (
                  <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                    All normal
                  </Badge>
                )
              )}
            </div>
          </div>
          {test.notes && (
            <>
              <Separator className="my-3" />
              <div className="flex items-start gap-1.5 text-sm">
                <FileText className="size-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{test.notes}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Results by Category */}
      {totalResults === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="size-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">No results recorded</h3>
            <p className="text-muted-foreground mt-1">
              This test has no parameter results.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedCategories.map((category) => {
            const results = groupedResults.get(category)!;
            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {CATEGORY_LABELS[category] || category}
                  </CardTitle>
                  <CardDescription>
                    {results.length}{" "}
                    {results.length === 1 ? "parameter" : "parameters"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Parameter</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Reference Range</TableHead>
                        <TableHead>Flag</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow
                          key={result.id}
                          className={getFlagRowClasses(result.flag)}
                        >
                          <TableCell className="pl-6 font-medium">
                            {result.parameter.name}
                            {result.parameter.nameTh && (
                              <span className="text-muted-foreground text-xs ml-1.5">
                                ({result.parameter.nameTh})
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {result.parameter.isQualitative
                              ? result.valueText || "-"
                              : result.value != null
                              ? result.value
                              : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {result.unit || result.parameter.unit || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {result.parameter.isQualitative
                              ? "-"
                              : getRefRange(result.parameter)}
                          </TableCell>
                          <TableCell>
                            {result.flag && (
                              <Badge
                                className={`text-xs ${getFlagBadgeClasses(result.flag)}`}
                              >
                                {result.flag}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
