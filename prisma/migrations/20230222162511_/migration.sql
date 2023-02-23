-- CreateTable
CREATE TABLE "Word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "parent" TEXT NOT NULL,
    "weight" INTEGER NOT NULL
);
