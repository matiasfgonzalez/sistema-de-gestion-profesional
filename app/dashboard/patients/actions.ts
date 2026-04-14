"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { patientFormSchema, type PatientFormValues } from "@/lib/validations/patient";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function getPatients(search?: string, page: number = 1, limit: number = 10) {
  const user = await getCurrentUserOrThrow();

  const where: Prisma.PatientWhereInput = {
    isActive: true,
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { dni: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ],
    }),
  };

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.patient.count({ where }),
  ]);

  return {
    patients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getPatientById(id: string) {
  const user = await getCurrentUserOrThrow();

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: { date: "desc" },
        take: 5,
      },
      sessions: {
        orderBy: { date: "desc" },
        take: 5,
      },
    },
  });

  return patient;
}

export async function createPatient(data: PatientFormValues) {
  const user = await getCurrentUserOrThrow();

  const validated = patientFormSchema.parse(data);

  const patient = await prisma.patient.create({
    data: {
      firstName: validated.firstName,
      lastName: validated.lastName,
      dni: validated.dni,
      phone: validated.phone,
      email: validated.email || null,
      dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
      gender: validated.gender || null,
      address: validated.address || null,
      medicalHistory: validated.medicalHistory || null,
      observations: validated.observations || null,
    },
  });

  revalidatePath("/dashboard/patients");
  return patient;
}

export async function updatePatient(id: string, data: PatientFormValues) {
  const user = await getCurrentUserOrThrow();

  const validated = patientFormSchema.parse(data);

  const patient = await prisma.patient.update({
    where: { id },
    data: {
      firstName: validated.firstName,
      lastName: validated.lastName,
      dni: validated.dni,
      phone: validated.phone,
      email: validated.email || null,
      dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
      gender: validated.gender || null,
      address: validated.address || null,
      medicalHistory: validated.medicalHistory || null,
      observations: validated.observations || null,
    },
  });

  revalidatePath("/dashboard/patients");
  return patient;
}

export async function deletePatient(id: string) {
  const user = await getCurrentUserOrThrow();

  // Soft delete
  const patient = await prisma.patient.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });

  revalidatePath("/dashboard/patients");
  return patient;
}
