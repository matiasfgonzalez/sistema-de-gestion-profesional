"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertCanAccessOwnedResource, getCurrentUserOrThrow } from "@/lib/auth";
import { 
  clinicalHistorySchema, type ClinicalHistoryValues,
  careEpisodeSchema, type CareEpisodeValues,
  evaluationSchema, type EvaluationValues,
  sessionEvolutionSchema, type SessionEvolutionValues 
} from "@/lib/validations/clinical";
import { CareEpisodeStatus } from "@prisma/client";

async function assertPatientExistsAndActive(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId, isActive: true },
    select: { id: true },
  });

  if (!patient) {
    throw new Error("El paciente no existe o está inactivo");
  }
}

async function assertEpisodeBelongsToPatient(episodeId: string, patientId: string) {
  const episode = await prisma.careEpisode.findUnique({
    where: { id: episodeId },
    select: {
      id: true,
      patientId: true,
      status: true,
      kinesicDiagnosis: true,
      treatmentGoals: true,
      treatmentPlan: true,
    },
  });

  if (!episode) {
    throw new Error("El episodio clínico no existe");
  }

  if (episode.patientId !== patientId) {
    throw new Error("El episodio no corresponde al paciente seleccionado");
  }

  return episode;
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
  } catch (error: any) {

    console.error("[getClinicalHistory] Error:", error);
    throw new Error(error?.message || "Error al obtener la historia clínica");
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
  } catch (error: any) {

    console.error("[updateClinicalHistory] Error:", error);
    throw new Error(error?.message || "Error al actualizar la historia clínica");
  }
}

export async function getCareEpisodes(patientId: string) {
  try {
    await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);

    return await prisma.careEpisode.findMany({
      where: { patientId },
      include: {
        _count: {
          select: {
            evaluations: true,
            sessions: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { startDate: "desc" }, { createdAt: "desc" }],
    });
  } catch (error: any) {

    console.error("[getCareEpisodes] Error:", error);
    throw new Error(error?.message || "Error al obtener los episodios clínicos");
  }
}

export async function createCareEpisode(patientId: string, data: CareEpisodeValues) {
  try {
    await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);

    const validated = careEpisodeSchema.parse(data);

    const episode = await prisma.careEpisode.create({
      data: {
        patientId,
        title: validated.title,
        focusArea: validated.focusArea || null,
        startDate: new Date(validated.startDate),
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        status: validated.status,
        chiefComplaint: validated.chiefComplaint || null,
        currentCondition: validated.currentCondition || null,
        kinesicDiagnosis: validated.kinesicDiagnosis || null,
        treatmentGoals: validated.treatmentGoals || null,
        treatmentPlan: validated.treatmentPlan || null,
        dischargeSummary: validated.dischargeSummary || null,
      },
    });

    revalidatePath(`/dashboard/patients/${patientId}/history`);
    return episode;
  } catch (error: any) {

    console.error("[createCareEpisode] Error:", error);
    throw new Error(error?.message || "Error al crear el episodio clínico");
  }
}

export async function updateCareEpisode(id: string, patientId: string, data: CareEpisodeValues) {
  try {
    await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);
    await assertEpisodeBelongsToPatient(id, patientId);

    const validated = careEpisodeSchema.parse(data);

    const episode = await prisma.careEpisode.update({
      where: { id },
      data: {
        title: validated.title,
        focusArea: validated.focusArea || null,
        startDate: new Date(validated.startDate),
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        status: validated.status,
        chiefComplaint: validated.chiefComplaint || null,
        currentCondition: validated.currentCondition || null,
        kinesicDiagnosis: validated.kinesicDiagnosis || null,
        treatmentGoals: validated.treatmentGoals || null,
        treatmentPlan: validated.treatmentPlan || null,
        dischargeSummary: validated.dischargeSummary || null,
      },
    });

    revalidatePath(`/dashboard/patients/${patientId}/history`);
    return episode;
  } catch (error: any) {

    console.error("[updateCareEpisode] Error:", error);
    throw new Error(error?.message || "Error al actualizar el episodio clínico");
  }
}

export async function getEpisodeWorkflowSummary(episodeId: string, patientId: string) {
  try {
    await getCurrentUserOrThrow();
    const episode = await assertEpisodeBelongsToPatient(episodeId, patientId);

    const [evaluations, sessions] = await Promise.all([
      prisma.evaluation.findMany({
        where: { episodeId },
        select: { type: true },
      }),
      prisma.session.count({
        where: { episodeId },
      }),
    ]);

    const hasInitialEvaluation = evaluations.some((item) => item.type === "INIT");
    const hasFollowUpEvaluation = evaluations.some((item) => item.type === "FOLLOW_UP");
    const hasDischargeEvaluation = evaluations.some((item) => item.type === "DISCHARGE");
    const hasPlan =
      Boolean(episode.kinesicDiagnosis?.trim()) &&
      Boolean(episode.treatmentGoals?.trim()) &&
      Boolean(episode.treatmentPlan?.trim());

    let currentStage =
      "Evaluación inicial pendiente";

    if (episode.status === CareEpisodeStatus.DISCHARGED || hasDischargeEvaluation) {
      currentStage = "Alta";
    } else if (hasFollowUpEvaluation) {
      currentStage = "Reevaluación";
    } else if (sessions > 0) {
      currentStage = "Sesiones en curso";
    } else if (hasPlan) {
      currentStage = "Plan terapéutico definido";
    } else if (hasInitialEvaluation) {
      currentStage = "Plan terapéutico pendiente";
    }

    return {
      hasInitialEvaluation,
      hasPlan,
      sessionsCount: sessions,
      hasFollowUpEvaluation,
      hasDischargeEvaluation,
      currentStage,
    };
  } catch (error: any) {

    console.error("[getEpisodeWorkflowSummary] Error:", error);
    throw new Error(error?.message || "Error al obtener el flujo del episodio");
  }
}

export async function getEvaluations(patientId: string, episodeId?: string) {
  try {
    const user = await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);
    if (episodeId) {
      await assertEpisodeBelongsToPatient(episodeId, patientId);
    }

    const evaluations = await prisma.evaluation.findMany({
      where: { 
        patientId,
        ...(episodeId ? { episodeId } : {}),
        ...(user.role === "ADMIN" ? {} : { professionalId: user.id }),
      },
      orderBy: { evalDate: "desc" },
    });

    return evaluations;
  } catch (error: any) {

    console.error("[getEvaluations] Error:", error);
    throw new Error(error?.message || "Error al obtener evaluaciones");
  }
}

export async function createEvaluation(patientId: string, episodeId: string, data: EvaluationValues) {
  try {
    const user = await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);
    const episode = await assertEpisodeBelongsToPatient(episodeId, patientId);

    if (episode.status === CareEpisodeStatus.DISCHARGED) {
      throw new Error("No se pueden registrar evaluaciones en un episodio dado de alta");
    }

    const validated = evaluationSchema.parse(data);

    if (validated.type !== "INIT") {
      const workflow = await getEpisodeWorkflowSummary(episodeId, patientId);
      if (!workflow.hasInitialEvaluation) {
        throw new Error("Debe registrar una evaluación inicial antes de agregar reevaluaciones o altas");
      }
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        patientId,
        episodeId,
        professionalId: user.id,
        ...validated,
        painScale: validated.painScale !== "" ? Number(validated.painScale) : null,
      },
    });

    if (validated.type === "DISCHARGE") {
      await prisma.careEpisode.update({
        where: { id: episodeId },
        data: {
          status: CareEpisodeStatus.DISCHARGED,
          endDate: new Date(),
        },
      });
    }

    revalidatePath(`/dashboard/patients/${patientId}/history`);
    return evaluation;
  } catch (error: any) {

    console.error("[createEvaluation] Error:", error);
    throw new Error(error?.message || "Error al grabar evaluación");
  }
}

export async function updateEvaluation(id: string, patientId: string, episodeId: string, data: EvaluationValues) {
  try {
    const user = await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);
    const episode = await assertEpisodeBelongsToPatient(episodeId, patientId);

    const existing = await prisma.evaluation.findUnique({
      where: { id },
      select: {
        id: true,
        patientId: true,
        episodeId: true,
        professionalId: true,
      },
    });

    if (!existing) {
      throw new Error("Evaluación no encontrada");
    }

    if (existing.patientId !== patientId) {
      throw new Error("La evaluación no corresponde al paciente seleccionado");
    }

    if (existing.episodeId !== episodeId) {
      throw new Error("La evaluación no corresponde al episodio seleccionado");
    }

    assertCanAccessOwnedResource(
      user,
      existing.professionalId,
      "No tienes permiso para editar esta evaluación"
    );

    if (episode.status === CareEpisodeStatus.DISCHARGED) {
      throw new Error("No se pueden editar evaluaciones en un episodio dado de alta");
    }

    const validated = evaluationSchema.parse(data);

    if (validated.type !== "INIT") {
      const workflow = await getEpisodeWorkflowSummary(episodeId, patientId);
      if (!workflow.hasInitialEvaluation && existing.id !== (await prisma.evaluation.findFirst({ where: { episodeId, type: "INIT" } }))?.id) {
        throw new Error("Debe existir una evaluación inicial antes de cambiar a reevaluaciones o altas");
      }
    }

    const evaluation = await prisma.evaluation.update({
      where: { id },
      data: {
        episodeId,
        ...validated,
        painScale: validated.painScale !== "" ? Number(validated.painScale) : null,
      },
    });

    if (validated.type === "DISCHARGE") {
      await prisma.careEpisode.update({
        where: { id: episodeId },
        data: {
          status: CareEpisodeStatus.DISCHARGED,
          endDate: new Date(),
        },
      });
    }

    revalidatePath(`/dashboard/patients/${patientId}/history`);
    return evaluation;
  } catch (error: any) {

    console.error("[updateEvaluation] Error:", error);
    throw new Error(error?.message || "Error al actualizar evaluación");
  }
}

export async function deleteEvaluation(id: string, patientId: string, episodeId: string) {
  try {
    const user = await getCurrentUserOrThrow();
    await assertEpisodeBelongsToPatient(episodeId, patientId);

    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      select: {
        id: true,
        patientId: true,
        episodeId: true,
        professionalId: true,
      },
    });

    if (!evaluation) {
      throw new Error("Evaluación no encontrada");
    }

    if (evaluation.patientId !== patientId) {
      throw new Error("La evaluación no corresponde al paciente seleccionado");
    }

    if (evaluation.episodeId !== episodeId) {
      throw new Error("La evaluación no corresponde al episodio seleccionado");
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
  } catch (error: any) {

    console.error("[deleteEvaluation] Error:", error);
    throw new Error(error?.message || "Error al eliminar evaluación");
  }
}

export async function getSessions(patientId: string, episodeId?: string) {
  try {
    const user = await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);
    if (episodeId) {
      await assertEpisodeBelongsToPatient(episodeId, patientId);
    }

    const sessions = await prisma.session.findMany({
      where: { 
        patientId,
        ...(episodeId ? { episodeId } : {}),
        ...(user.role === "ADMIN" ? {} : { professionalId: user.id }),
      },
      orderBy: { date: "desc" },
    });

    return sessions;
  } catch (error: any) {

    console.error("[getSessions] Error:", error);
    throw new Error(error?.message || "Error al obtener sesiones");
  }
}

export async function createSession(patientId: string, episodeId: string, data: SessionEvolutionValues) {
  try {
    const user = await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);
    const episode = await assertEpisodeBelongsToPatient(episodeId, patientId);

    if (episode.status === CareEpisodeStatus.DISCHARGED) {
      throw new Error("No se pueden registrar sesiones en un episodio dado de alta");
    }

    const workflow = await getEpisodeWorkflowSummary(episodeId, patientId);
    if (!workflow.hasInitialEvaluation) {
      throw new Error("Debe registrar una evaluación inicial antes de registrar sesiones");
    }
    if (!workflow.hasPlan) {
      throw new Error("Debe definir el plan terapéutico en el episodio antes de registrar sesiones");
    }

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
        episodeId,
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
  } catch (error: any) {

    console.error("[createSession] Error:", error);
    throw new Error(error?.message || "Error al crear sesión");
  }
}

export async function updateSession(id: string, patientId: string, episodeId: string, data: SessionEvolutionValues) {
  try {
    const user = await getCurrentUserOrThrow();
    await assertPatientExistsAndActive(patientId);
    const episode = await assertEpisodeBelongsToPatient(episodeId, patientId);

    const existing = await prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        patientId: true,
        episodeId: true,
        professionalId: true,
      },
    });

    if (!existing) {
      throw new Error("Sesión no encontrada");
    }

    if (existing.patientId !== patientId) {
      throw new Error("La sesión no corresponde al paciente seleccionado");
    }

    if (existing.episodeId !== episodeId) {
      throw new Error("La sesión no corresponde al episodio seleccionado");
    }

    assertCanAccessOwnedResource(
      user,
      existing.professionalId,
      "No tienes permiso para editar esta sesión"
    );

    if (episode.status === CareEpisodeStatus.DISCHARGED) {
      throw new Error("No se pueden editar sesiones en un episodio dado de alta");
    }

    const workflow = await getEpisodeWorkflowSummary(episodeId, patientId);
    if (!workflow.hasInitialEvaluation) {
      throw new Error("Debe registrar una evaluación inicial antes de editar sesiones");
    }
    if (!workflow.hasPlan) {
      throw new Error("Debe confirmar que el episodio tenga plan terapéutico para editar sesiones");
    }

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
        episodeId,
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
  } catch (error: any) {

    console.error("[updateSession] Error:", error);
    throw new Error(error?.message || "Error al actualizar sesión");
  }
}

export async function deleteSession(id: string, patientId: string, episodeId: string) {
  try {
    const user = await getCurrentUserOrThrow();
    await assertEpisodeBelongsToPatient(episodeId, patientId);

    const session = await prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        patientId: true,
        episodeId: true,
        professionalId: true,
      },
    });

    if (!session) {
      throw new Error("Sesión no encontrada");
    }

    if (session.patientId !== patientId) {
      throw new Error("La sesión no corresponde al paciente seleccionado");
    }

    if (session.episodeId !== episodeId) {
      throw new Error("La sesión no corresponde al episodio seleccionado");
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
  } catch (error: any) {

    console.error("[deleteSession] Error:", error);
    throw new Error(error?.message || "Error al eliminar sesión");
  }
}
