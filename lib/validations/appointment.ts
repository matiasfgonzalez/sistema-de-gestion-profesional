import { z } from "zod";
import { AppointmentStatus } from "@prisma/client";

export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Debe seleccionar un paciente"),
  date: z.string().min(1, "La fecha es obligatoria"),
  startTime: z.string().min(1, "La hora de inicio es obligatoria"),
  endTime: z.string().min(1, "La hora de fin es obligatoria"),
  status: z.nativeEnum(AppointmentStatus).default(AppointmentStatus.PENDING),
  reason: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
