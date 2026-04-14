"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { 
  clinicalHistorySchema, type ClinicalHistoryValues,
  evaluationSchema, type EvaluationValues,
  sessionEvolutionSchema, type SessionEvolutionValues 
} from "@/lib/validations/clinical";

export async function getClinicalHistory(patientId: string) {
  try {
    await getCurrentUserOrThrow();

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

    const evaluations = await prisma.evaluation.findMany({
      where: { 
        patientId,
        professionalId: user.id
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

export async function deleteEvaluation(id: string, patientId: string) {
  try {
    await getCurrentUserOrThrow();

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

    const sessions = await prisma.session.findMany({
      where: { 
        patientId,
        professionalId: user.id
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

    const validated = sessionEvolutionSchema.parse(data);

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

export async function deleteSession(id: string, patientId: string) {
  try {
    await getCurrentUserOrThrow();

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
