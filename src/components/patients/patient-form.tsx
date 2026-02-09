"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface PatientData {
  id: string;
  name: string;
  hn: string | null;
  species: string;
  breed: string | null;
  sex: string | null;
  birthDate: Date | string | null;
  ownerName: string | null;
  ownerPhone: string | null;
  notes: string | null;
}

interface PatientFormProps {
  patient?: PatientData;
  action: (formData: FormData) => Promise<void>;
}

export function PatientForm({ patient, action }: PatientFormProps) {
  const isEdit = !!patient;

  const formatDate = (date: Date | string | null): string => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().split("T")[0];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Patient" : "New Patient"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Patient name"
                defaultValue={patient?.name ?? ""}
              />
            </div>

            {/* HN */}
            <div className="space-y-2">
              <Label htmlFor="hn">Hospital Number (HN)</Label>
              <Input
                id="hn"
                name="hn"
                placeholder="e.g. HN-001"
                defaultValue={patient?.hn ?? ""}
              />
            </div>

            {/* Species */}
            <div className="space-y-2">
              <Label htmlFor="species">Species</Label>
              <Select
                name="species"
                defaultValue={patient?.species ?? "DOG"}
              >
                <SelectTrigger id="species" className="w-full">
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOG">Dog</SelectItem>
                  <SelectItem value="CAT">Cat</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Breed */}
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                name="breed"
                placeholder="e.g. Golden Retriever"
                defaultValue={patient?.breed ?? ""}
              />
            </div>

            {/* Sex */}
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select
                name="sex"
                defaultValue={patient?.sex ?? ""}
              >
                <SelectTrigger id="sex" className="w-full">
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="MALE_NEUTERED">Male (Neutered)</SelectItem>
                  <SelectItem value="FEMALE_SPAYED">Female (Spayed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                defaultValue={formatDate(patient?.birthDate ?? null)}
              />
            </div>

            {/* Owner Name */}
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                name="ownerName"
                placeholder="Owner's name"
                defaultValue={patient?.ownerName ?? ""}
              />
            </div>

            {/* Owner Phone */}
            <div className="space-y-2">
              <Label htmlFor="ownerPhone">Owner Phone</Label>
              <Input
                id="ownerPhone"
                name="ownerPhone"
                placeholder="e.g. 081-234-5678"
                defaultValue={patient?.ownerPhone ?? ""}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional notes about the patient..."
              rows={3}
              defaultValue={patient?.notes ?? ""}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button type="submit">
              {isEdit ? "Update Patient" : "Create Patient"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
