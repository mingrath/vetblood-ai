import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient, updatePatient } from "@/app/actions";
import { PatientForm } from "@/components/patients/patient-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(id);

  if (!patient) {
    notFound();
  }

  const updatePatientWithId = updatePatient.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/patients/${id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Patient</h1>
          <p className="text-muted-foreground">
            Update information for {patient.name}
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <PatientForm patient={patient} action={updatePatientWithId} />
      </div>
    </div>
  );
}
