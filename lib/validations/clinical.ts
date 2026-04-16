import { z } from "zod";
import { CareEpisodeStatus } from "@prisma/client";

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

export const careEpisodeSchema = z.object({
  title: z.string().min(1, "El nombre del episodio es obligatorio"),
  focusArea: z.string().optional().or(z.literal("")),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  endDate: z.string().optional().or(z.literal("")),
  status: z.nativeEnum(CareEpisodeStatus).default(CareEpisodeStatus.ACTIVE),
  chiefComplaint: z.string().optional().or(z.literal("")),
  currentCondition: z.string().optional().or(z.literal("")),
  kinesicDiagnosis: z.string().optional().or(z.literal("")),
  treatmentGoals: z.string().optional().or(z.literal("")),
  treatmentPlan: z.string().optional().or(z.literal("")),
  dischargeSummary: z.string().optional().or(z.literal("")),
}).superRefine((values, ctx) => {
  if (values.endDate && values.startDate && values.endDate < values.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha de cierre no puede ser anterior al inicio",
      path: ["endDate"],
    });
  }

  if (values.status === CareEpisodeStatus.DISCHARGED && !values.endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Debes indicar una fecha de alta para cerrar el episodio",
      path: ["endDate"],
    });
  }
});

export type CareEpisodeFormInput = z.input<typeof careEpisodeSchema>;
export type CareEpisodeValues = z.output<typeof careEpisodeSchema>;

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

export type EvaluationFormInput = z.input<typeof evaluationSchema>;
export type EvaluationValues = z.output<typeof evaluationSchema>;

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

export type SessionEvolutionFormInput = z.input<typeof sessionEvolutionSchema>;
export type SessionEvolutionValues = z.output<typeof sessionEvolutionSchema>;
