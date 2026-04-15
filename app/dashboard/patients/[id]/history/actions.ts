"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertCanAccessOwnedResource, getCurrentUserOrThrow } from "@/lib/auth";
import { 
  clinicalHistorySchema, type ClinicalHistoryValues,
  evaluationSchema, type EvaluationValues,
  sessionEvolutionSchema, type SessionEvolutionValues 
} from "@/lib/validations/clinical";

async function assertPatientExistsAndActive(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId, isActive: true },
    select: { id: true },
  });

  if (!patient) {
    throw new Error("El paciente no existe o está inactivo");
  }
}

export async function getClinicalHistory(patientId: string) {
  try {
    await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);

    let history = await prisma.clinicalHistory.findUnique({
      where: { patientId },
    });

    // Retro-compatibility / Auto-init if not exists
    if (!history) {
      history = await prisma.clinicalHistory.create({
        data: { patientId },
      });
    }

    return history;
  } catch (error) {
    console.error("[getClinicalHistory] Error:", error);
    throw new Error("Error al obtener la historia clínica");
  }
}

export async function updateClinicalHistory(patientId: string, data: ClinicalHistoryValues) {
  try {
    await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);

    const validated = clinicalHistorySchema.parse(data);

    const history = await prisma.clinicalHistory.upsert({
      where: { patientId },
      update: validated,
      create: {
        patientId,
        ...validated
      }
    });

    revalidatePath(`/dashboard/patients/${patientId}/history`);
    return history;
  } catch (error) {
    console.error("[updateClinicalHistory] Error:", error);
    throw new Error("Error al actualizar la historia clínica");
  }
}

export async function getEvaluations(patientId: string) {
  try {
    const user = await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);

    const evaluations = await prisma.evaluation.findMany({
      where: { 
        patientId,
        ...(user.role === "ADMIN" ? {} : { professionalId: user.id }),
      },
      orderBy: { evalDate: "desc" },
    });

    return evaluations;
  } catch (error) {
    console.error("[getEvaluations] Error:", error);
    throw new Error("Error al obtener evaluaciones");
  }
}

export async function createEvaluation(patientId: string, data: EvaluationValues) {
  try {
    const user = await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);

    const validated = evaluationSchema.parse(data);

    const evaluation = await prisma.evaluation.create({
      data: {
        patientId,
        professionalId: user.id,
        ...validated,
        painScale: validated.painScale !== "" ? Number(validated.painScale) : null,
      },
    });

    revalidatePath(`/dashboard/patients/${patientId}/history`);
    return evaluation;
  } catch (error) {
    console.error("[createEvaluation] Error:", error);
    throw new Error("Error al grabar evaluación");
  }
}

export async function updateEvaluation(id: string, patientId: string, data: EvaluationValues) {
  try {
    const user = await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);

    const existing = await prisma.evaluation.findUnique({
      where: { id },
      select: {
        id: true,
        patientId: true,
        professionalId: true,
      },
    });

    if (!existing) {
      throw new Error("Evaluación no encontrada");
    }

    if (existing.patientId !== patientId) {
      throw new Error("La evaluación no corresponde al paciente seleccionado");
    }

    assertCanAccessOwnedResource(
      user,
      existing.professionalId,
      "No tienes permiso para editar esta evaluación"
    );

    const validated = evaluationSchema.parse(data);

    const evaluation = await prisma.evaluation.update({
      where: { id },
      data: {
        ...validated,
        painScale: validated.painScale !== "" ? Number(validated.painScale) : null,
      },
    });

    revalidatePath(`/dashboard/patients/${patientId}/history`);
    return evaluation;
  } catch (error) {
    console.error("[updateEvaluation] Error:", error);
    throw new Error("Error al actualizar evaluación");
  }
}

export async function deleteEvaluation(id: string, patientId: string) {
  try {
    const user = await getCurrentUserOrThrow();

    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      select: {
        id: true,
        patientId: true,
        professionalId: true,
      },
    });

    if (!evaluation) {
      throw new Error("Evaluación no encontrada");
    }

    if (evaluation.patientId !== patientId) {
      throw new Error("La evaluación no corresponde al paciente seleccionado");
    }

    assertCanAccessOwnedResource(
      user,
      evaluation.professionalId,
      "No tienes permiso para eliminar esta evaluación"
    );

    await prisma.evaluation.delete({
      where: { id },
    });

    revalidatePath(`/dashboard/patients/${patientId}/history`);
    return true;
  } catch (error) {
    console.error("[deleteEvaluation] Error:", error);
    throw new Error("Error al eliminar evaluación");
  }
}

export async function getSessions(patientId: string) {
  try {
    const user = await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);

    const sessions = await prisma.session.findMany({
      where: { 
        patientId,
        ...(user.role === "ADMIN" ? {} : { professionalId: user.id }),
      },
      orderBy: { date: "desc" },
    });

    return sessions;
  } catch (error) {
    console.error("[getSessions] Error:", error);
    throw new Error("Error al obtener sesiones");
  }
}

export async function createSession(patientId: string, data: SessionEvolutionValues) {
  try {
    const user = await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);

    const validated = sessionEvolutionSchema.parse(data);

    if (validated.appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: validated.appointmentId },
        select: {
          id: true,
          patientId: true,
          professionalId: true,
        },
      });

      if (!appointment) {
        throw new Error("El turno asociado no existe");
      }

      if (appointment.patientId !== patientId) {
        throw new Error("El turno asociado no corresponde al paciente");
      }

      assertCanAccessOwnedResource(
        user,
        appointment.professionalId,
        "No tienes permiso para vincular este turno"
      );
    }

    const session = await prisma.session.create({
      data: {
        patientId,
        professionalId: user.id,
        date: new Date(validated.date),
        startTime: validated.startTime || "00:00",
        duration: validated.duration,
        treatmentType: validated.treatmentType,
        painLevel: validated.painLevel !== "" ? Number(validated.painLevel) : null,
        patientState: validated.patientState || null,
        progressMetrics: validated.progressMetrics || null,
        notes: validated.notes || null,
        appointmentId: validated.appointmentId || undefined,
      },
    });

    revalidatePath(`/dashboard/patients/${patientId}/history`);
    return session;
  } catch (error) {
    console.error("[createSession] Error:", error);
    throw new Error("Error al crear sesión");
  }
}

export async function updateSession(id: string, patientId: string, data: SessionEvolutionValues) {
  try {
    const user = await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);

    const existing = await prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        patientId: true,
        professionalId: true,
      },
    });

    if (!existing) {
      throw new Error("Sesión no encontrada");
    }

    if (existing.patientId !== patientId) {
      throw new Error("La sesión no corresponde al paciente seleccionado");
    }

    assertCanAccessOwnedResource(
      user,
      existing.professionalId,
      "No tienes permiso para editar esta sesión"
    );

    const validated = sessionEvolutionSchema.parse(data);

    if (validated.appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: validated.appointmentId },
        select: {
          id: true,
          patientId: true,
          professionalId: true,
        },
      });

      if (!appointment) {
        throw new Error("El turno asociado no existe");
      }

      if (appointment.patientId !== patientId) {
        throw new Error("El turno asociado no corresponde al paciente");
      }

      assertCanAccessOwnedResource(
        user,
        appointment.professionalId,
        "No tienes permiso para vincular este turno"
      );
    }

    const session = await prisma.session.update({
      where: { id },
      data: {
        date: new Date(validated.date),
        startTime: validated.startTime || "00:00",
        duration: validated.duration,
        treatmentType: validated.treatmentType,
        painLevel: validated.painLevel !== "" ? Number(validated.painLevel) : null,
        patientState: validated.patientState || null,
        progressMetrics: validated.progressMetrics || null,
        notes: validated.notes || null,
        appointmentId: validated.appointmentId || null,
      },
    });

    revalidatePath(`/dashboard/patients/${patientId}/history`);
    return session;
  } catch (error) {
    console.error("[updateSession] Error:", error);
    throw new Error("Error al actualizar sesión");
  }
}

export async function deleteSession(id: string, patientId: string) {
  try {
    const user = await getCurrentUserOrThrow();

    const session = await prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        patientId: true,
        professionalId: true,
      },
    });

    if (!session) {
      throw new Error("Sesión no encontrada");
    }

    if (session.patientId !== patientId) {
      throw new Error("La sesión no corresponde al paciente seleccionado");
    }

    assertCanAccessOwnedResource(
      user,
      session.professionalId,
      "No tienes permiso para eliminar esta sesión"
    );

    await prisma.session.delete({
      where: { id },
    });

    revalidatePath(`/dashboard/patients/${patientId}/history`);
    return true;
  } catch (error) {
    console.error("[deleteSession] Error:", error);
    throw new Error("Error al eliminar sesión");
  }
}
