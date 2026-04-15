"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { appointmentFormSchema, type AppointmentFormValues } from "@/lib/validations/appointment";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { Prisma } from "@prisma/client";

async function assertActivePatient(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId, isActive: true },
    select: { id: true },
  });

  if (!patient) {
    throw new Error("El paciente seleccionado no existe o está inactivo");
  }
}

async function assertNoOverlappingAppointment(params: {
  professionalId: string;
  date: Date;
  startTime: string;
  endTime: string;
  ignoreAppointmentId?: string;
}) {
  const overlappingAppointment = await prisma.appointment.findFirst({
    where: {
      professionalId: params.professionalId,
      date: params.date,
      id: params.ignoreAppointmentId ? { not: params.ignoreAppointmentId } : undefined,
      status: {
        notIn: ["CANCELLED", "NO_SHOW"],
      },
      startTime: {
        lt: params.endTime,
      },
      endTime: {
        gt: params.startTime,
      },
    },
    select: { id: true },
  });

  if (overlappingAppointment) {
    throw new Error("Existe un turno superpuesto para ese horario");
  }
}

export async function getAppointments(search?: string, page: number = 1, limit: number = 10) {
  try {
    const user = await getCurrentUserOrThrow();

    const where: Prisma.AppointmentWhereInput = {
      professionalId: user.id,
      ...(search && {
        OR: [
          { patient: { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
          { patient: { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
          { patient: { dni: { contains: search, mode: Prisma.QueryMode.insensitive } } },
          { reason: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dni: true,
            },
          },
        },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[getAppointments] Error:", error);
    throw new Error("Error al obtener los turnos");
  }
}

export async function getAppointmentById(id: string) {
  try {
    const user = await getCurrentUserOrThrow();

    const appointment = await prisma.appointment.findUnique({
      where: {
        id,
        professionalId: user.id,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new Error("Turno no encontrado");
    }

    return appointment;
  } catch (error) {
    console.error("[getAppointmentById] Error:", error);
    throw new Error("Error al obtener el turno");
  }
}

export async function createAppointment(data: AppointmentFormValues) {
  try {
    const user = await getCurrentUserOrThrow();

    const validated = appointmentFormSchema.parse(data);
    const appointmentDate = new Date(validated.date);

    await assertActivePatient(validated.patientId);
    await assertNoOverlappingAppointment({
      professionalId: user.id,
      date: appointmentDate,
      startTime: validated.startTime,
      endTime: validated.endTime,
    });

    const appointment = await prisma.appointment.create({
      data: {
        patientId: validated.patientId,
        professionalId: user.id,
        date: appointmentDate,
        startTime: validated.startTime,
        endTime: validated.endTime,
        status: validated.status,
        reason: validated.reason || null,
        notes: validated.notes || null,
      },
      include: {
        patient: true,
      },
    });

    revalidatePath("/dashboard/appointments");
    return appointment;
  } catch (error) {
    console.error("[createAppointment] Error:", error);
    throw new Error("Error al crear el turno");
  }
}

export async function updateAppointment(id: string, data: AppointmentFormValues) {
  try {
    const user = await getCurrentUserOrThrow();

    const validated = appointmentFormSchema.parse(data);

    // Verify ownership
    const existing = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existing || existing.professionalId !== user.id) {
      throw new Error("No puedes editar este turno");
    }

    const appointmentDate = new Date(validated.date);
    await assertActivePatient(validated.patientId);
    await assertNoOverlappingAppointment({
      professionalId: user.id,
      date: appointmentDate,
      startTime: validated.startTime,
      endTime: validated.endTime,
      ignoreAppointmentId: id,
    });

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        patientId: validated.patientId,
        date: appointmentDate,
        startTime: validated.startTime,
        endTime: validated.endTime,
        status: validated.status,
        reason: validated.reason || null,
        notes: validated.notes || null,
      },
      include: {
        patient: true,
      },
    });

    revalidatePath("/dashboard/appointments");
    return appointment;
  } catch (error) {
    console.error("[updateAppointment] Error:", error);
    throw new Error("Error al actualizar el turno");
  }
}

export async function deleteAppointment(id: string) {
  try {
    const user = await getCurrentUserOrThrow();

    const existing = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existing || existing.professionalId !== user.id) {
      throw new Error("No tienes permiso para eliminar este turno");
    }

    const res = await prisma.appointment.delete({
      where: { id },
    });

    revalidatePath("/dashboard/appointments");
    return res;
  } catch (error) {
    console.error("[deleteAppointment] Error:", error);
    throw new Error("Error al eliminar el turno");
  }
}

// Lightweight function to load combobox patients
export async function getPatientsForCombobox() {
  try {
    await getCurrentUserOrThrow();

    const patients = await prisma.patient.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dni: true,
      },
      orderBy: { lastName: "asc" },
    });

    return patients;
  } catch (error) {
    console.error("[getPatientsForCombobox] Error:", error);
    return [];
  }
}

export async function getAppointmentsByDateRange(startDate: string, endDate: string) {
  try {
    const user = await getCurrentUserOrThrow();

    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId: user.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return appointments;
  } catch (error) {
    console.error("[getAppointmentsByDateRange] Error:", error);
    throw new Error("Error al obtener los turnos del calendario");
  }
}
