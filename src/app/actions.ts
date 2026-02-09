"use server";

import { prisma } from "@/lib/db";
import { calculateFlag } from "@/lib/flags";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

// ============ PATIENT ACTIONS ============

export async function createPatient(formData: FormData) {
  const patient = await prisma.patient.create({
    data: {
      name: formData.get("name") as string,
      hn: (formData.get("hn") as string) || null,
      species: (formData.get("species") as string) || "DOG",
      breed: (formData.get("breed") as string) || null,
      sex: (formData.get("sex") as string) || null,
      birthDate: formData.get("birthDate")
        ? new Date(formData.get("birthDate") as string)
        : null,
      ownerName: (formData.get("ownerName") as string) || null,
      ownerPhone: (formData.get("ownerPhone") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });
  redirect(`/patients/${patient.id}`);
}

export async function updatePatient(id: string, formData: FormData) {
  await prisma.patient.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      hn: (formData.get("hn") as string) || null,
      species: (formData.get("species") as string) || "DOG",
      breed: (formData.get("breed") as string) || null,
      sex: (formData.get("sex") as string) || null,
      birthDate: formData.get("birthDate")
        ? new Date(formData.get("birthDate") as string)
        : null,
      ownerName: (formData.get("ownerName") as string) || null,
      ownerPhone: (formData.get("ownerPhone") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath(`/patients/${id}`);
  redirect(`/patients/${id}`);
}

export async function deletePatient(id: string) {
  await prisma.patient.delete({ where: { id } });
  revalidatePath("/patients");
  redirect("/patients");
}

// ============ BLOOD TEST ACTIONS ============

export async function createBloodTest(data: {
  patientId: string;
  testDate: string;
  labName?: string;
  labNo?: string;
  ocrMethod?: string;
  ocrRawText?: string;
  notes?: string;
  sourceFilePath?: string;
  results: Array<{
    parameterId: string;
    value?: number | null;
    valueText?: string | null;
    unit?: string | null;
    ocrOriginalValue?: string | null;
    manuallyCorrected?: boolean;
  }>;
}) {
  // Get patient species for flag calculation
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { id: data.patientId },
  });

  // Get all parameters for flag calculation
  const parameters = await prisma.parameter.findMany();
  const paramMap = new Map(parameters.map((p) => [p.id, p]));

  const bloodTest = await prisma.bloodTest.create({
    data: {
      patientId: data.patientId,
      testDate: new Date(data.testDate),
      labName: data.labName || null,
      labNo: data.labNo || null,
      ocrMethod: data.ocrMethod || "MANUAL",
      ocrRawText: data.ocrRawText || null,
      notes: data.notes || null,
      sourceFilePath: data.sourceFilePath || null,
      testResults: {
        create: data.results
          .filter((r) => r.value != null || r.valueText)
          .map((r) => {
            const param = paramMap.get(r.parameterId);
            const flag = param
              ? calculateFlag(
                  r.value ?? null,
                  patient.species,
                  param.dogRefMin,
                  param.dogRefMax,
                  param.catRefMin,
                  param.catRefMax
                )
              : null;
            return {
              parameterId: r.parameterId,
              value: r.value ?? null,
              valueText: r.valueText || null,
              unit: r.unit || param?.unit || null,
              flag,
              ocrOriginalValue: r.ocrOriginalValue || null,
              manuallyCorrected: r.manuallyCorrected || false,
            };
          }),
      },
    },
  });

  revalidatePath(`/patients/${data.patientId}`);
  redirect(`/patients/${data.patientId}/tests/${bloodTest.id}`);
}

export async function deleteBloodTest(testId: string, patientId: string) {
  await prisma.bloodTest.delete({ where: { id: testId } });
  revalidatePath(`/patients/${patientId}`);
  redirect(`/patients/${patientId}`);
}

// ============ FILE UPLOAD ============

export async function uploadFile(formData: FormData): Promise<string> {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(uploadDir, filename);

  await writeFile(filePath, buffer);
  return filePath;
}

// ============ SETTINGS ============

export async function updateSettings(formData: FormData) {
  await prisma.appSettings.upsert({
    where: { id: "default" },
    update: {
      geminiApiKey: (formData.get("geminiApiKey") as string) || null,
      defaultLabTemplate: (formData.get("defaultLabTemplate") as string) || null,
      locale: (formData.get("locale") as string) || "en",
    },
    create: {
      id: "default",
      geminiApiKey: (formData.get("geminiApiKey") as string) || null,
      defaultLabTemplate: (formData.get("defaultLabTemplate") as string) || null,
      locale: (formData.get("locale") as string) || "en",
    },
  });
  revalidatePath("/settings");
}

// ============ DATA FETCHING ============

export async function getPatients(search?: string, species?: string) {
  return prisma.patient.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search } },
                { ownerName: { contains: search } },
                { hn: { contains: search } },
              ],
            }
          : {},
        species && species !== "ALL" ? { species } : {},
      ],
    },
    include: {
      _count: { select: { bloodTests: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPatient(id: string) {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      bloodTests: {
        orderBy: { testDate: "desc" },
        include: {
          testResults: {
            include: { parameter: true },
            orderBy: { parameter: { sortOrder: "asc" } },
          },
        },
      },
    },
  });
}

export async function getBloodTest(id: string) {
  return prisma.bloodTest.findUnique({
    where: { id },
    include: {
      patient: true,
      testResults: {
        include: { parameter: true },
        orderBy: { parameter: { sortOrder: "asc" } },
      },
    },
  });
}

export async function getParameters() {
  return prisma.parameter.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function getSettings() {
  return prisma.appSettings.findUnique({
    where: { id: "default" },
  });
}

export async function getTrendData(patientId: string, parameterIds: string[]) {
  const results = await prisma.testResult.findMany({
    where: {
      bloodTest: { patientId },
      parameterId: { in: parameterIds },
      value: { not: null },
    },
    include: {
      bloodTest: { select: { testDate: true } },
      parameter: true,
    },
    orderBy: { bloodTest: { testDate: "asc" } },
  });
  return results;
}

export async function getDashboardStats() {
  const [patientCount, testCount, recentTests, abnormalResults] =
    await Promise.all([
      prisma.patient.count(),
      prisma.bloodTest.count(),
      prisma.bloodTest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          patient: true,
          testResults: {
            where: { flag: { in: ["HIGH", "LOW"] } },
            include: { parameter: true },
          },
        },
      }),
      prisma.testResult.count({
        where: { flag: { in: ["HIGH", "LOW"] } },
      }),
    ]);

  return { patientCount, testCount, recentTests, abnormalResults };
}
