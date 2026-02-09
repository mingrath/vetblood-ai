-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hn" TEXT,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL DEFAULT 'DOG',
    "breed" TEXT,
    "sex" TEXT,
    "birthDate" DATETIME,
    "ownerName" TEXT,
    "ownerPhone" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BloodTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "testDate" DATETIME NOT NULL,
    "labName" TEXT,
    "labNo" TEXT,
    "sourceFilePath" TEXT,
    "ocrMethod" TEXT,
    "ocrRawText" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BloodTest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bloodTestId" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "value" REAL,
    "valueText" TEXT,
    "unit" TEXT,
    "flag" TEXT,
    "ocrOriginalValue" TEXT,
    "manuallyCorrected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TestResult_bloodTestId_fkey" FOREIGN KEY ("bloodTestId") REFERENCES "BloodTest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestResult_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "Parameter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Parameter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTh" TEXT,
    "category" TEXT NOT NULL,
    "unit" TEXT,
    "dogRefMin" REAL,
    "dogRefMax" REAL,
    "catRefMin" REAL,
    "catRefMax" REAL,
    "isQualitative" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LabTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "parsingRules" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "anthropicApiKey" TEXT,
    "defaultLabTemplate" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en'
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_hn_key" ON "Patient"("hn");

-- CreateIndex
CREATE UNIQUE INDEX "TestResult_bloodTestId_parameterId_key" ON "TestResult"("bloodTestId", "parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "Parameter_code_key" ON "Parameter"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LabTemplate_name_key" ON "LabTemplate"("name");
