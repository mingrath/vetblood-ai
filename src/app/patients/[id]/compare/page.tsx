import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient, getParameters } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GitCompareArrows } from "lucide-react";
import { CompareView } from "@/components/compare/compare-view";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [patient, parameters] = await Promise.all([
    getPatient(id),
    getParameters(),
  ]);

  if (!patient) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/patients/${patient.id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GitCompareArrows className="size-7" />
            Compare Tests
          </h1>
          <p className="text-muted-foreground">
            Side-by-side comparison for {patient.name}
          </p>
        </div>
      </div>

      {/* Compare View */}
      <CompareView patient={patient} parameters={parameters} />
    </div>
  );
}
