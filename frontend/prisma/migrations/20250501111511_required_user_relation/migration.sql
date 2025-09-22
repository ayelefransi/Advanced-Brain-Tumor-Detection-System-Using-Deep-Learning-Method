-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "scans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "patientId" TEXT,
    "originalImage" TEXT NOT NULL,
    "segmentationMask" TEXT NOT NULL,
    "tumorType" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "hasTumor" BOOLEAN NOT NULL,
    "processingTime" REAL,
    "originalPath" TEXT,
    "maskPath" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "scans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("email") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "scans_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalScans" INTEGER NOT NULL DEFAULT 0,
    "tumorDetections" INTEGER NOT NULL DEFAULT 0,
    "avgConfidence" REAL NOT NULL DEFAULT 0,
    "avgProcessingTime" REAL NOT NULL DEFAULT 0,
    "tumorDistribution" TEXT NOT NULL,
    "accuracy" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Healthy',
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "scans_createdAt_idx" ON "scans"("createdAt");
