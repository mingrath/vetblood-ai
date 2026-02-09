import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const parameters = [
    // HEMATOLOGY
    { code: "RBC", name: "Red Blood Cell Count", nameTh: "จำนวนเม็ดเลือดแดง", category: "HEMATOLOGY", unit: "x10⁶/µL", dogRefMin: 5.5, dogRefMax: 8.5, catRefMin: 5.0, catRefMax: 10.0, sortOrder: 1 },
    { code: "HGB", name: "Hemoglobin", nameTh: "ฮีโมโกลบิน", category: "HEMATOLOGY", unit: "g/dL", dogRefMin: 12.0, dogRefMax: 18.0, catRefMin: 8.0, catRefMax: 15.0, sortOrder: 2 },
    { code: "HCT", name: "Hematocrit", nameTh: "ฮีมาโตคริต", category: "HEMATOLOGY", unit: "%", dogRefMin: 37.0, dogRefMax: 55.0, catRefMin: 24.0, catRefMax: 45.0, sortOrder: 3 },
    { code: "WBC", name: "White Blood Cell Count", nameTh: "จำนวนเม็ดเลือดขาว", category: "HEMATOLOGY", unit: "x10³/µL", dogRefMin: 6.0, dogRefMax: 17.0, catRefMin: 5.5, catRefMax: 19.5, sortOrder: 4 },
    { code: "NEU", name: "Neutrophils", nameTh: "นิวโทรฟิล", category: "HEMATOLOGY", unit: "%", dogRefMin: 60.0, dogRefMax: 77.0, catRefMin: 35.0, catRefMax: 75.0, sortOrder: 5 },
    { code: "BAND", name: "Band Neutrophils", nameTh: "แบนด์นิวโทรฟิล", category: "HEMATOLOGY", unit: "%", dogRefMin: 0.0, dogRefMax: 3.0, catRefMin: 0.0, catRefMax: 3.0, sortOrder: 6 },
    { code: "EOS", name: "Eosinophils", nameTh: "อีโอซิโนฟิล", category: "HEMATOLOGY", unit: "%", dogRefMin: 2.0, dogRefMax: 10.0, catRefMin: 2.0, catRefMax: 12.0, sortOrder: 7 },
    { code: "LYM", name: "Lymphocytes", nameTh: "ลิมโฟไซต์", category: "HEMATOLOGY", unit: "%", dogRefMin: 12.0, dogRefMax: 30.0, catRefMin: 20.0, catRefMax: 55.0, sortOrder: 8 },
    { code: "MONO", name: "Monocytes", nameTh: "โมโนไซต์", category: "HEMATOLOGY", unit: "%", dogRefMin: 3.0, dogRefMax: 10.0, catRefMin: 1.0, catRefMax: 4.0, sortOrder: 9 },
    { code: "MCV", name: "Mean Corpuscular Volume", nameTh: "ปริมาตรเฉลี่ยเม็ดเลือดแดง", category: "HEMATOLOGY", unit: "fL", dogRefMin: 60.0, dogRefMax: 77.0, catRefMin: 39.0, catRefMax: 55.0, sortOrder: 10 },
    { code: "MCH", name: "Mean Corpuscular Hemoglobin", nameTh: "ฮีโมโกลบินเฉลี่ยเม็ดเลือดแดง", category: "HEMATOLOGY", unit: "pg", dogRefMin: 19.5, dogRefMax: 24.5, catRefMin: 12.5, catRefMax: 17.5, sortOrder: 11 },
    { code: "MCHC", name: "Mean Corpuscular Hemoglobin Concentration", nameTh: "ความเข้มข้นฮีโมโกลบินเฉลี่ย", category: "HEMATOLOGY", unit: "g/dL", dogRefMin: 31.0, dogRefMax: 36.0, catRefMin: 30.0, catRefMax: 36.0, sortOrder: 12 },
    { code: "RDW", name: "Red Cell Distribution Width", nameTh: "ความกว้างการกระจายเม็ดเลือดแดง", category: "HEMATOLOGY", unit: "%", dogRefMin: 14.0, dogRefMax: 20.0, catRefMin: 14.0, catRefMax: 20.0, sortOrder: 13 },
    { code: "PLT", name: "Platelet Count", nameTh: "จำนวนเกล็ดเลือด", category: "HEMATOLOGY", unit: "x10³/µL", dogRefMin: 175.0, dogRefMax: 500.0, catRefMin: 175.0, catRefMax: 500.0, sortOrder: 14 },
    { code: "RETIC", name: "Reticulocyte Count", nameTh: "จำนวนเรติคูโลไซต์", category: "HEMATOLOGY", unit: "%", dogRefMin: 0.0, dogRefMax: 1.5, catRefMin: 0.0, catRefMax: 1.0, sortOrder: 15 },

    // CHEMISTRY
    { code: "ALT", name: "SGPT (ALT)", nameTh: "เอนไซม์ตับ ALT", category: "CHEMISTRY", unit: "U/L", dogRefMin: 10.0, dogRefMax: 125.0, catRefMin: 12.0, catRefMax: 130.0, sortOrder: 20 },
    { code: "AST", name: "SGOT (AST)", nameTh: "เอนไซม์ตับ AST", category: "CHEMISTRY", unit: "U/L", dogRefMin: 0.0, dogRefMax: 50.0, catRefMin: 0.0, catRefMax: 48.0, sortOrder: 21 },
    { code: "CREA", name: "Creatinine", nameTh: "ครีเอตินีน", category: "CHEMISTRY", unit: "mg/dL", dogRefMin: 0.5, dogRefMax: 1.8, catRefMin: 0.8, catRefMax: 2.4, sortOrder: 22 },
    { code: "BUN", name: "Blood Urea Nitrogen", nameTh: "บียูเอ็น", category: "CHEMISTRY", unit: "mg/dL", dogRefMin: 7.0, dogRefMax: 27.0, catRefMin: 16.0, catRefMax: 36.0, sortOrder: 23 },
    { code: "ALP", name: "Alkaline Phosphatase", nameTh: "อัลคาไลน์ฟอสฟาเทส", category: "CHEMISTRY", unit: "U/L", dogRefMin: 23.0, dogRefMax: 212.0, catRefMin: 14.0, catRefMax: 111.0, sortOrder: 24 },
    { code: "TBIL", name: "Bilirubin Total", nameTh: "บิลิรูบินรวม", category: "CHEMISTRY", unit: "mg/dL", dogRefMin: 0.0, dogRefMax: 0.5, catRefMin: 0.0, catRefMax: 0.5, sortOrder: 25 },
    { code: "DBIL", name: "Bilirubin Direct", nameTh: "บิลิรูบินตรง", category: "CHEMISTRY", unit: "mg/dL", dogRefMin: 0.0, dogRefMax: 0.15, catRefMin: 0.0, catRefMax: 0.15, sortOrder: 26 },

    // PARASITOLOGY
    { code: "BPARA", name: "Blood Parasites", nameTh: "พยาธิในเลือด", category: "PARASITOLOGY", unit: null, dogRefMin: null, dogRefMax: null, catRefMin: null, catRefMax: null, isQualitative: true, sortOrder: 30 },
  ];

  for (const param of parameters) {
    await prisma.parameter.upsert({
      where: { code: param.code },
      update: param,
      create: param,
    });
  }

  await prisma.appSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  console.log("Seed completed: parameters and app settings created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
