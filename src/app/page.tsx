import Link from "next/link";
import { format } from "date-fns";
import { getDashboardStats } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PawPrint,
  TestTubeDiagonal,
  AlertTriangle,
  Plus,
} from "lucide-react";

export default async function DashboardPage() {
  const { patientCount, testCount, recentTests, abnormalResults } =
    await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vet Blood Tracker</h1>
        <p className="text-muted-foreground">
          Dashboard overview of patients and blood test results
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <PawPrint className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <TestTubeDiagonal className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Abnormal Results</CardTitle>
            <AlertTriangle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{abnormalResults}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Blood Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Blood Tests</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TestTubeDiagonal className="size-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold">No blood tests yet</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Get started by adding patients and recording their blood tests.
              </p>
              <Button asChild>
                <Link href="/patients/new">
                  <Plus className="size-4" />
                  Add Patient
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Lab</TableHead>
                  <TableHead>Abnormal</TableHead>
                  <TableHead>Flagged Parameters</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTests.map((test) => {
                  const abnormalCount = test.testResults.length;
                  const abnormalNames = test.testResults.map(
                    (r) => r.parameter.name
                  );

                  return (
                    <TableRow key={test.id}>
                      <TableCell>
                        <Link
                          href={`/patients/${test.patient.id}`}
                          className="font-medium hover:underline"
                        >
                          {test.patient.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {format(new Date(test.testDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {test.labName || "-"}
                      </TableCell>
                      <TableCell>
                        {abnormalCount > 0 ? (
                          <Badge variant="destructive">{abnormalCount}</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {abnormalNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {abnormalNames.map((name) => (
                              <Badge
                                key={name}
                                variant="outline"
                                className="text-xs"
                              >
                                {name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
