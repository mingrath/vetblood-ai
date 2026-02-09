export const dynamic = "force-dynamic";

import Link from "next/link";
import { getPatients } from "@/app/actions";
import { PatientSearch } from "@/components/patients/patient-search";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, TestTubeDiagonal, User } from "lucide-react";

function getSpeciesEmoji(species: string) {
  switch (species) {
    case "DOG":
      return "🐕";
    case "CAT":
      return "🐈";
    default:
      return "🐾";
  }
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; species?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? undefined;
  const species = params.species ?? undefined;
  const patients = await getPatients(search, species);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage your veterinary patients
          </p>
        </div>
        <Button asChild>
          <Link href="/patients/new">
            <Plus className="size-4" />
            Add Patient
          </Link>
        </Button>
      </div>

      {/* Search & Filters */}
      <PatientSearch />

      {/* Patient Grid */}
      {patients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">🐾</div>
            <h3 className="text-lg font-semibold">No patients found</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              {search || species
                ? "Try adjusting your search or filters."
                : "Get started by adding your first patient."}
            </p>
            {!search && !species && (
              <Button asChild>
                <Link href="/patients/new">
                  <Plus className="size-4" />
                  Add Patient
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <Link key={patient.id} href={`/patients/${patient.id}`}>
              <Card className="transition-colors hover:border-primary/50 hover:shadow-md h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-xl">
                      {getSpeciesEmoji(patient.species)}
                    </span>
                    {patient.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {patient.breed && (
                    <p className="text-muted-foreground">{patient.breed}</p>
                  )}
                  <div className="flex flex-col gap-1.5 text-muted-foreground">
                    {patient.ownerName && (
                      <div className="flex items-center gap-1.5">
                        <User className="size-3.5" />
                        <span>{patient.ownerName}</span>
                      </div>
                    )}
                    {patient.hn && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium bg-muted px-1.5 py-0.5 rounded">
                          HN
                        </span>
                        <span>{patient.hn}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <TestTubeDiagonal className="size-3.5" />
                      <span>
                        {patient._count.bloodTests}{" "}
                        {patient._count.bloodTests === 1 ? "test" : "tests"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
