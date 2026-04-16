-- CreateEnum
CREATE TYPE "CareEpisodeStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'DISCHARGED', 'CANCELLED');

-- CreateTable
CREATE TABLE "CareEpisode" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "focusArea" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" "CareEpisodeStatus" NOT NULL DEFAULT 'ACTIVE',
    "chiefComplaint" TEXT,
    "currentCondition" TEXT,
    "kinesicDiagnosis" TEXT,
    "treatmentGoals" TEXT,
    "treatmentPlan" TEXT,
    "dischargeSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareEpisode_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Evaluation" ADD COLUMN "episodeId" TEXT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN "episodeId" TEXT;

-- CreateIndex
CREATE INDEX "CareEpisode_patientId_idx" ON "CareEpisode"("patientId");
CREATE INDEX "CareEpisode_status_idx" ON "CareEpisode"("status");
CREATE INDEX "CareEpisode_startDate_idx" ON "CareEpisode"("startDate");
CREATE INDEX "Evaluation_episodeId_idx" ON "Evaluation"("episodeId");
CREATE INDEX "Session_episodeId_idx" ON "Session"("episodeId");

-- Backfill one legacy episode per patient with historical clinical data
INSERT INTO "CareEpisode" (
    "id",
    "patientId",
    "title",
    "startDate",
    "status",
    "chiefComplaint",
    "currentCondition",
    "kinesicDiagnosis",
    "treatmentGoals",
    "treatmentPlan",
    "createdAt",
    "updatedAt"
)
SELECT
    concat('legacy_episode_', p."id"),
    p."id",
    CASE
        WHEN ch."reasonForConsultation" IS NOT NULL AND btrim(ch."reasonForConsultation") <> '' THEN ch."reasonForConsultation"
        ELSE 'Episodio clínico histórico'
    END,
    COALESCE(ch."createdAt", p."createdAt", CURRENT_TIMESTAMP),
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM "Evaluation" e
            WHERE e."patientId" = p."id" AND e."type" = 'DISCHARGE'
        ) THEN 'DISCHARGED'::"CareEpisodeStatus"
        ELSE 'ACTIVE'::"CareEpisodeStatus"
    END,
    ch."reasonForConsultation",
    ch."currentIllness",
    ch."kinesicDiagnosis",
    ch."treatmentGoals",
    ch."treatmentPlan",
    COALESCE(ch."createdAt", CURRENT_TIMESTAMP),
    CURRENT_TIMESTAMP
FROM "Patient" p
LEFT JOIN "ClinicalHistory" ch ON ch."patientId" = p."id"
WHERE EXISTS (SELECT 1 FROM "Evaluation" e WHERE e."patientId" = p."id")
   OR EXISTS (SELECT 1 FROM "Session" s WHERE s."patientId" = p."id");

-- Link existing records to their backfilled episode
UPDATE "Evaluation" e
SET "episodeId" = concat('legacy_episode_', e."patientId")
WHERE e."episodeId" IS NULL;

UPDATE "Session" s
SET "episodeId" = concat('legacy_episode_', s."patientId")
WHERE s."episodeId" IS NULL;

-- AddForeignKey
ALTER TABLE "CareEpisode" ADD CONSTRAINT "CareEpisode_patientId_fkey"
FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_episodeId_fkey"
FOREIGN KEY ("episodeId") REFERENCES "CareEpisode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Session" ADD CONSTRAINT "Session_episodeId_fkey"
FOREIGN KEY ("episodeId") REFERENCES "CareEpisode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
