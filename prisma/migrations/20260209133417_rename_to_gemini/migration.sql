/*
  Warnings:

  - You are about to drop the column `anthropicApiKey` on the `AppSettings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "geminiApiKey" TEXT,
    "defaultLabTemplate" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en'
);
INSERT INTO "new_AppSettings" ("defaultLabTemplate", "id", "locale") SELECT "defaultLabTemplate", "id", "locale" FROM "AppSettings";
DROP TABLE "AppSettings";
ALTER TABLE "new_AppSettings" RENAME TO "AppSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
