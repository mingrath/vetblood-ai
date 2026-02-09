import { createPatient } from "@/app/actions";
import { PatientForm } from "@/components/patients/patient-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewPatientPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/patients">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Patient</h1>
          <p className="text-muted-foreground">
            Register a new patient in the system
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <PatientForm action={createPatient} />
      </div>
    </div>
  );
}
