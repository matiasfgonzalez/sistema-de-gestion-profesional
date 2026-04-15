import { z } from "zod";
import { AppointmentStatus } from "@prisma/client";

export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Debe seleccionar un paciente"),
  date: z.string().min(1, "La fecha es obligatoria"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido"),
  status: z.nativeEnum(AppointmentStatus).default(AppointmentStatus.PENDING),
  reason: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
}).superRefine((values, ctx) => {
  const startMinutes = toMinutes(values.startTime);
  const endMinutes = toMinutes(values.endTime);

  if (startMinutes >= endMinutes) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La hora de inicio debe ser menor que la hora de fin",
      path: ["endTime"],
    });
    return;
  }

  const duration = endMinutes - startMinutes;
  if (duration < 15) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La duración mínima del turno es de 15 minutos",
      path: ["endTime"],
    });
  }

  if (duration > 240) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La duración máxima del turno es de 240 minutos",
      path: ["endTime"],
    });
  }
});

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
