import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.testResult.deleteMany();
  await prisma.bloodTest.deleteMany();
  await prisma.patient.deleteMany();

  // Get all parameters
  const params = await prisma.parameter.findMany();
  const p = (code: string) => params.find((x) => x.code === code)!;

  // ========== Patient 1: มะลิ (Jasmine) - Golden Retriever Dog ==========
  const mali = await prisma.patient.create({
    data: {
      name: "มะลิ",
      hn: "HN-2025-001",
      species: "DOG",
      breed: "Golden Retriever",
      sex: "FEMALE_SPAYED",
      birthDate: new Date("2020-03-15"),
      ownerName: "คุณสมศรี วงศ์สุข",
      ownerPhone: "081-234-5678",
      notes: "Yearly checkup patient. Mild weight gain noted.",
    },
  });

  // Mali Test 1 - Oct 2025 (mostly normal)
  await prisma.bloodTest.create({
    data: {
      patientId: mali.id,
      testDate: new Date("2025-10-15"),
      labName: "Central Vet Lab",
      labNo: "CVL-2025-1042",
      ocrMethod: "MANUAL",
      notes: "Annual checkup - overall good health",
      testResults: {
        create: [
          { parameterId: p("RBC").id, value: 7.2, unit: "x10⁶/µL", flag: "NORMAL" },
          { parameterId: p("HGB").id, value: 15.5, unit: "g/dL", flag: "NORMAL" },
          { parameterId: p("HCT").id, value: 44.0, unit: "%", flag: "NORMAL" },
          { parameterId: p("WBC").id, value: 10.5, unit: "x10³/µL", flag: "NORMAL" },
          { parameterId: p("PLT").id, value: 280.0, unit: "x10³/µL", flag: "NORMAL" },
          { parameterId: p("ALT").id, value: 45.0, unit: "U/L", flag: "NORMAL" },
          { parameterId: p("CREA").id, value: 1.1, unit: "mg/dL", flag: "NORMAL" },
          { parameterId: p("BUN").id, value: 18.0, unit: "mg/dL", flag: "NORMAL" },
          { parameterId: p("BPARA").id, valueText: "Not found", flag: null },
        ],
      },
    },
  });

  // Mali Test 2 - Dec 2025 (some values drifting)
  await prisma.bloodTest.create({
    data: {
      patientId: mali.id,
      testDate: new Date("2025-12-20"),
      labName: "Central Vet Lab",
      labNo: "CVL-2025-1198",
      ocrMethod: "GEMINI",
      notes: "Follow-up - owner reports decreased appetite",
      testResults: {
        create: [
          { parameterId: p("RBC").id, value: 6.8, unit: "x10⁶/µL", flag: "NORMAL" },
          { parameterId: p("HGB").id, value: 14.2, unit: "g/dL", flag: "NORMAL" },
          { parameterId: p("HCT").id, value: 41.0, unit: "%", flag: "NORMAL" },
          { parameterId: p("WBC").id, value: 14.2, unit: "x10³/µL", flag: "NORMAL" },
          { parameterId: p("PLT").id, value: 310.0, unit: "x10³/µL", flag: "NORMAL" },
          { parameterId: p("ALT").id, value: 88.0, unit: "U/L", flag: "NORMAL" },
          { parameterId: p("CREA").id, value: 1.5, unit: "mg/dL", flag: "NORMAL" },
          { parameterId: p("BUN").id, value: 24.0, unit: "mg/dL", flag: "NORMAL" },
          { parameterId: p("BPARA").id, valueText: "Not found", flag: null },
        ],
      },
    },
  });

  // Mali Test 3 - Feb 2026 (ALT elevated, CREA borderline high)
  await prisma.bloodTest.create({
    data: {
      patientId: mali.id,
      testDate: new Date("2026-02-05"),
      labName: "Central Vet Lab",
      labNo: "CVL-2026-0087",
      ocrMethod: "GEMINI",
      notes: "Recheck - ALT trending up, monitor liver function",
      testResults: {
        create: [
          { parameterId: p("RBC").id, value: 6.5, unit: "x10⁶/µL", flag: "NORMAL" },
          { parameterId: p("HGB").id, value: 13.8, unit: "g/dL", flag: "NORMAL" },
          { parameterId: p("HCT").id, value: 39.5, unit: "%", flag: "NORMAL" },
          { parameterId: p("WBC").id, value: 17.8, unit: "x10³/µL", flag: "HIGH" },
          { parameterId: p("PLT").id, value: 265.0, unit: "x10³/µL", flag: "NORMAL" },
          { parameterId: p("ALT").id, value: 142.0, unit: "U/L", flag: "HIGH" },
          { parameterId: p("CREA").id, value: 1.9, unit: "mg/dL", flag: "HIGH" },
          { parameterId: p("BUN").id, value: 28.0, unit: "mg/dL", flag: "HIGH" },
          { parameterId: p("BPARA").id, valueText: "Not found", flag: null },
        ],
      },
    },
  });

  // ========== Patient 2: หินอ่อน (Marble) - Scottish Fold Cat ==========
  const marble = await prisma.patient.create({
    data: {
      name: "หินอ่อน",
      hn: "HN-2025-002",
      species: "CAT",
      breed: "Scottish Fold",
      sex: "MALE_NEUTERED",
      birthDate: new Date("2019-08-22"),
      ownerName: "คุณวิชัย พงศ์ไพบูลย์",
      ownerPhone: "092-876-5432",
      notes: "CKD stage 2 patient. On renal diet.",
    },
  });

  // Marble Test 1 - Nov 2025
  await prisma.bloodTest.create({
    data: {
      patientId: marble.id,
      testDate: new Date("2025-11-10"),
      labName: "PetCare Lab",
      labNo: "PCL-4521",
      ocrMethod: "MANUAL",
      notes: "Initial CKD workup",
      testResults: {
        create: [
          { parameterId: p("RBC").id, value: 7.8, unit: "x10⁶/µL", flag: "NORMAL" },
          { parameterId: p("HGB").id, value: 11.5, unit: "g/dL", flag: "NORMAL" },
          { parameterId: p("HCT").id, value: 34.0, unit: "%", flag: "NORMAL" },
          { parameterId: p("WBC").id, value: 8.2, unit: "x10³/µL", flag: "NORMAL" },
          { parameterId: p("ALT").id, value: 48.0, unit: "U/L", flag: "NORMAL" },
          { parameterId: p("CREA").id, value: 2.8, unit: "mg/dL", flag: "HIGH" },
          { parameterId: p("BUN").id, value: 42.0, unit: "mg/dL", flag: "HIGH" },
          { parameterId: p("BPARA").id, valueText: "Not found", flag: null },
        ],
      },
    },
  });

  // Marble Test 2 - Jan 2026 (improving with treatment)
  await prisma.bloodTest.create({
    data: {
      patientId: marble.id,
      testDate: new Date("2026-01-18"),
      labName: "PetCare Lab",
      labNo: "PCL-4798",
      ocrMethod: "GEMINI",
      notes: "Recheck after starting renal diet - improving",
      testResults: {
        create: [
          { parameterId: p("RBC").id, value: 8.1, unit: "x10⁶/µL", flag: "NORMAL" },
          { parameterId: p("HGB").id, value: 12.0, unit: "g/dL", flag: "NORMAL" },
          { parameterId: p("HCT").id, value: 35.5, unit: "%", flag: "NORMAL" },
          { parameterId: p("WBC").id, value: 7.5, unit: "x10³/µL", flag: "NORMAL" },
          { parameterId: p("ALT").id, value: 38.0, unit: "U/L", flag: "NORMAL" },
          { parameterId: p("CREA").id, value: 2.5, unit: "mg/dL", flag: "HIGH" },
          { parameterId: p("BUN").id, value: 38.0, unit: "mg/dL", flag: "HIGH" },
          { parameterId: p("BPARA").id, valueText: "Not found", flag: null },
        ],
      },
    },
  });

  // ========== Patient 3: โชกุน (Shogun) - Shiba Inu Dog ==========
  const shogun = await prisma.patient.create({
    data: {
      name: "โชกุน",
      hn: "HN-2025-003",
      species: "DOG",
      breed: "Shiba Inu",
      sex: "MALE",
      birthDate: new Date("2022-01-10"),
      ownerName: "คุณนภา ศรีสุวรรณ",
      ownerPhone: "089-111-2233",
      notes: "Young healthy dog. Annual wellness check.",
    },
  });

  // Shogun Test 1 - Jan 2026 (healthy)
  await prisma.bloodTest.create({
    data: {
      patientId: shogun.id,
      testDate: new Date("2026-01-25"),
      labName: "Central Vet Lab",
      labNo: "CVL-2026-0055",
      ocrMethod: "TESSERACT",
      notes: "Annual wellness - all normal",
      testResults: {
        create: [
          { parameterId: p("RBC").id, value: 7.8, unit: "x10⁶/µL", flag: "NORMAL" },
          { parameterId: p("HGB").id, value: 16.5, unit: "g/dL", flag: "NORMAL" },
          { parameterId: p("HCT").id, value: 48.0, unit: "%", flag: "NORMAL" },
          { parameterId: p("WBC").id, value: 9.2, unit: "x10³/µL", flag: "NORMAL" },
          { parameterId: p("PLT").id, value: 350.0, unit: "x10³/µL", flag: "NORMAL" },
          { parameterId: p("ALT").id, value: 32.0, unit: "U/L", flag: "NORMAL" },
          { parameterId: p("CREA").id, value: 0.9, unit: "mg/dL", flag: "NORMAL" },
          { parameterId: p("BUN").id, value: 15.0, unit: "mg/dL", flag: "NORMAL" },
          { parameterId: p("BPARA").id, valueText: "Not found", flag: null },
        ],
      },
    },
  });

  console.log("Demo data seeded:");
  console.log(`  - มะลิ (Golden Retriever) with 3 blood tests`);
  console.log(`  - หินอ่อน (Scottish Fold) with 2 blood tests`);
  console.log(`  - โชกุน (Shiba Inu) with 1 blood test`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
