import { z } from "zod";

export const patientFormSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  dni: z.string().min(7, "El DNI debe tener al menos 7 caracteres").max(10),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  medicalHistory: z.string().optional().or(z.literal("")),
  observations: z.string().optional().or(z.literal("")),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
