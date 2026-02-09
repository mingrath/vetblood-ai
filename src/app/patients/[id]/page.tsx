import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getPatient } from "@/app/actions";
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
import { DeletePatientButton } from "@/components/patients/delete-patient-button";
import {
  ArrowLeft,
  Calendar,
  Edit,
  FlaskConical,
  Phone,
  Plus,
  TrendingUp,
  GitCompareArrows,
  User,
  Stethoscope,
  FileText,
} from "lucide-react";

function getSpeciesLabel(species: string) {
  switch (species) {
    case "DOG":
      return "Dog";
    case "CAT":
      return "Cat";
    default:
      return species;
  }
}

function getSexLabel(sex: string | null) {
  switch (sex) {
    case "MALE":
      return "Male";
    case "FEMALE":
      return "Female";
    case "MALE_NEUTERED":
      return "Male (Neutered)";
    case "FEMALE_SPAYED":
      return "Female (Spayed)";
    default:
      return null;
  }
}

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(id);

  if (!patient) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/patients">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
          <p className="text-muted-foreground">
            {getSpeciesLabel(patient.species)}
            {patient.breed ? ` - ${patient.breed}` : ""}
            {patient.hn ? ` | HN: ${patient.hn}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/patients/${patient.id}/edit`}>
              <Edit className="size-4" />
              Edit
            </Link>
          </Button>
          <DeletePatientButton
            patientId={patient.id}
            patientName={patient.name}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="size-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <InfoRow label="Name" value={patient.name} />
              <InfoRow label="Species" value={getSpeciesLabel(patient.species)} />
              {patient.breed && <InfoRow label="Breed" value={patient.breed} />}
              {patient.sex && (
                <InfoRow label="Sex" value={getSexLabel(patient.sex)} />
              )}
              {patient.birthDate && (
                <InfoRow
                  label="Birth Date"
                  value={format(new Date(patient.birthDate), "MMM d, yyyy")}
                />
              )}
              {patient.hn && <InfoRow label="HN" value={patient.hn} />}
            </div>

            {(patient.ownerName || patient.ownerPhone) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Owner Details
                  </p>
                  {patient.ownerName && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="size-4 text-muted-foreground" />
                      <span>{patient.ownerName}</span>
                    </div>
                  )}
                  {patient.ownerPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="size-4 text-muted-foreground" />
                      <span>{patient.ownerPhone}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {patient.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Notes
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
                </div>
              </>
            )}

            {/* Quick links */}
            <Separator />
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={`/patients/${patient.id}/trends`}>
                  <TrendingUp className="size-4" />
                  View Trends
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={`/patients/${patient.id}/compare`}>
                  <GitCompareArrows className="size-4" />
                  Compare Tests
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Blood Test History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Blood Test History</h2>
              <p className="text-sm text-muted-foreground">
                {patient.bloodTests.length}{" "}
                {patient.bloodTests.length === 1 ? "test" : "tests"} on record
              </p>
            </div>
            <Button asChild>
              <Link href={`/patients/${patient.id}/tests/new`}>
                <Plus className="size-4" />
                Add Blood Test
              </Link>
            </Button>
          </div>

          {patient.bloodTests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FlaskConical className="size-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold">No blood tests yet</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Add a blood test to start tracking results.
                </p>
                <Button asChild>
                  <Link href={`/patients/${patient.id}/tests/new`}>
                    <Plus className="size-4" />
                    Add Blood Test
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {patient.bloodTests.map((test) => {
                const abnormalCount = test.testResults.filter(
                  (r) => r.flag === "HIGH" || r.flag === "LOW"
                ).length;
                const totalResults = test.testResults.length;

                return (
                  <Link
                    key={test.id}
                    href={`/patients/${patient.id}/tests/${test.id}`}
                  >
                    <Card className="transition-colors hover:border-primary/50 hover:shadow-md mb-3">
                      <CardContent className="flex items-center gap-4 py-4">
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center self-stretch">
                          <div
                            className={`size-3 rounded-full mt-1 ${
                              abnormalCount > 0
                                ? "bg-red-500"
                                : "bg-green-500"
                            }`}
                          />
                          <div className="w-px flex-1 bg-border mt-1" />
                        </div>

                        {/* Test info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-sm font-medium">
                              <Calendar className="size-3.5 text-muted-foreground" />
                              {format(new Date(test.testDate), "MMM d, yyyy")}
                            </div>
                            {test.labName && (
                              <span className="text-sm text-muted-foreground">
                                {test.labName}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              <FileText className="size-3" />
                              {totalResults}{" "}
                              {totalResults === 1 ? "result" : "results"}
                            </Badge>
                            {abnormalCount > 0 ? (
                              <Badge variant="destructive" className="text-xs">
                                {abnormalCount} abnormal
                              </Badge>
                            ) : (
                              totalResults > 0 && (
                                <Badge
                                  className="text-xs bg-green-100 text-green-700 border-green-200"
                                >
                                  All normal
                                </Badge>
                              )
                            )}
                            {test.ocrMethod && test.ocrMethod !== "MANUAL" && (
                              <Badge variant="secondary" className="text-xs">
                                {test.ocrMethod}
                              </Badge>
                            )}
                          </div>
                          {test.notes && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {test.notes}
                            </p>
                          )}
                        </div>

                        <ArrowLeft className="size-4 text-muted-foreground rotate-180 shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
