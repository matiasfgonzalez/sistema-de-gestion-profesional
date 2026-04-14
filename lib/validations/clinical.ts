import { z } from "zod";

export const clinicalHistorySchema = z.object({
  reasonForConsultation: z.string().optional().or(z.literal("")),
  currentIllness: z.string().optional().or(z.literal("")),
  personalHistory: z.string().optional().or(z.literal("")),
  familyHistory: z.string().optional().or(z.literal("")),
  habits: z.string().optional().or(z.literal("")),
  alerts: z.string().optional().or(z.literal("")),
  kinesicDiagnosis: z.string().optional().or(z.literal("")),
  treatmentGoals: z.string().optional().or(z.literal("")),
  treatmentPlan: z.string().optional().or(z.literal("")),
});

export type ClinicalHistoryValues = z.infer<typeof clinicalHistorySchema>;

export const evaluationSchema = z.object({
  type: z.enum(["INIT", "FOLLOW_UP", "DISCHARGE"]).default("FOLLOW_UP"),
  painScale: z.coerce.number().min(0).max(10).optional().or(z.literal("")),
  subjective: z.string().optional().or(z.literal("")),
  objectivePosture: z.string().optional().or(z.literal("")),
  objectiveGait: z.string().optional().or(z.literal("")),
  objectiveROM: z.string().optional().or(z.literal("")),
  objectiveStrength: z.string().optional().or(z.literal("")),
  specialTests: z.string().optional().or(z.literal("")),
});

export type EvaluationValues = z.infer<typeof evaluationSchema>;

export const sessionEvolutionSchema = z.object({
  appointmentId: z.string().optional(),
  date: z.string().min(1, "La fecha es obligatoria"),
  startTime: z.string().optional().or(z.literal("")),
  duration: z.coerce.number().min(1).default(60),
  treatmentType: z.string().min(1, "Especifique el tipo de tratamiento"),
  painLevel: z.coerce.number().min(0).max(10).optional().or(z.literal("")),
  patientState: z.string().optional().or(z.literal("")),
  progressMetrics: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type SessionEvolutionValues = z.infer<typeof sessionEvolutionSchema>;
