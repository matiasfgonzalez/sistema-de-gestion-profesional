import { CareEpisodeStatus } from "@prisma/client";

export interface PatientHistoryPatient {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  dateOfBirth?: Date | null;
}

export interface ClinicalHistoryRecord {
  id: string;
  patientId: string;
  reasonForConsultation?: string | null;
  currentIllness?: string | null;
  personalHistory?: string | null;
  familyHistory?: string | null;
  habits?: string | null;
  alerts?: string | null;
  kinesicDiagnosis?: string | null;
  treatmentGoals?: string | null;
  treatmentPlan?: string | null;
}

export interface CareEpisodeRecord {
  id: string;
  patientId: string;
  title: string;
  focusArea?: string | null;
  startDate: Date;
  endDate?: Date | null;
  status: CareEpisodeStatus;
  chiefComplaint?: string | null;
  currentCondition?: string | null;
  kinesicDiagnosis?: string | null;
  treatmentGoals?: string | null;
  treatmentPlan?: string | null;
  dischargeSummary?: string | null;
  _count?: {
    evaluations: number;
    sessions: number;
  };
}

export interface EvaluationRecord {
  id: string;
  patientId: string;
  episodeId?: string | null;
  type: string;
  painScale?: number | null;
  subjective?: string | null;
  objectivePosture?: string | null;
  objectiveGait?: string | null;
  objectiveROM?: string | null;
  objectiveStrength?: string | null;
  specialTests?: string | null;
  evalDate: Date;
}

export interface SessionRecord {
  id: string;
  patientId: string;
  episodeId?: string | null;
  date: Date;
  startTime: string;
  duration: number;
  treatmentType: string;
  painLevel?: number | null;
  patientState?: string | null;
  progressMetrics?: string | null;
  notes?: string | null;
}
