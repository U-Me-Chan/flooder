/*
  Warnings:

  - Added the required column `stamp` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "parent" TEXT NOT NULL,
    "stamp" TEXT NOT NULL,
    "weight" INTEGER NOT NULL
);
INSERT INTO "new_Word" ("content", "id", "parent", "weight") SELECT "content", "id", "parent", "weight" FROM "Word";
DROP TABLE "Word";
ALTER TABLE "new_Word" RENAME TO "Word";
CREATE UNIQUE INDEX "Word_stamp_key" ON "Word"("stamp");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
