"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { patientFormSchema, type PatientFormValues } from "@/lib/validations/patient";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function getPatients(search?: string, page: number = 1, limit: number = 10) {
  try {
    await getCurrentUserOrThrow();

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
  } catch (error) {
    console.error("[getPatients] Error:", error);
    throw new Error("Error al obtener los pacientes");
  }
}

export async function getPatientById(id: string) {
  try {
    await getCurrentUserOrThrow();

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
  } catch (error) {
    console.error("[getPatientById] Error:", error);
    throw new Error("Error al obtener el paciente");
  }
}

export async function createPatient(data: PatientFormValues) {
  try {
    await getCurrentUserOrThrow();

    const validated = patientFormSchema.parse(data);

    // Check if DNI already exists
    const existingPatient = await prisma.patient.findUnique({
      where: { dni: validated.dni },
    });

    if (existingPatient) {
      throw new Error("Ya existe un paciente con ese DNI");
    }

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
  } catch (error) {
    console.error("[createPatient] Error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al crear el paciente");
  }
}

export async function updatePatient(id: string, data: PatientFormValues) {
  try {
    await getCurrentUserOrThrow();

    const validated = patientFormSchema.parse(data);

    // Check if DNI is taken by another patient
    const existingPatient = await prisma.patient.findFirst({
      where: {
        dni: validated.dni,
        id: { not: id },
      },
    });

    if (existingPatient) {
      throw new Error("Ya existe otro paciente con ese DNI");
    }

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
  } catch (error) {
    console.error("[updatePatient] Error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al actualizar el paciente");
  }
}

export async function deletePatient(id: string) {
  try {
    await getCurrentUserOrThrow();

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
  } catch (error) {
    console.error("[deletePatient] Error:", error);
    throw new Error("Error al eliminar el paciente");
  }
}
