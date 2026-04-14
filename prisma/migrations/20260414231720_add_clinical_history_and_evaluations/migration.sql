-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "painLevel" INTEGER,
ADD COLUMN     "patientState" TEXT,
ADD COLUMN     "progressMetrics" TEXT;

-- CreateTable
CREATE TABLE "ClinicalHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "reasonForConsultation" TEXT,
    "currentIllness" TEXT,
    "personalHistory" TEXT,
    "familyHistory" TEXT,
    "habits" TEXT,
    "alerts" TEXT,
    "kinesicDiagnosis" TEXT,
    "treatmentGoals" TEXT,
    "treatmentPlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "evalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "painScale" INTEGER,
    "subjective" TEXT,
    "objectivePosture" TEXT,
    "objectiveGait" TEXT,
    "objectiveROM" TEXT,
    "objectiveStrength" TEXT,
    "specialTests" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClinicalHistory_patientId_key" ON "ClinicalHistory"("patientId");

-- CreateIndex
CREATE INDEX "Evaluation_patientId_idx" ON "Evaluation"("patientId");

-- CreateIndex
CREATE INDEX "Evaluation_evalDate_idx" ON "Evaluation"("evalDate");

-- AddForeignKey
ALTER TABLE "ClinicalHistory" ADD CONSTRAINT "ClinicalHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
