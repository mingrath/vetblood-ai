import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient, getParameters, getSettings } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { NewTestForm } from "@/components/tests/new-test-form";
import { ArrowLeft } from "lucide-react";

export default async function NewTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [patient, parameters, settings] = await Promise.all([
    getPatient(id),
    getParameters(),
    getSettings(),
  ]);

  if (!patient) {
    notFound();
  }

  const hasApiKey = !!settings?.geminiApiKey;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/patients/${id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            New Blood Test
          </h1>
          <p className="text-muted-foreground">
            Add blood test results for {patient.name}
          </p>
        </div>
      </div>

      <NewTestForm patient={patient} parameters={parameters} hasApiKey={hasApiKey} />
    </div>
  );
}
