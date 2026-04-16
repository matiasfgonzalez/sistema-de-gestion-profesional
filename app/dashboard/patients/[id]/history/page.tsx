'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CareEpisodeStatus } from '@prisma/client';
import { getPatientById } from '../../actions';
import {
  getCareEpisodes,
  getClinicalHistory,
  getEvaluations,
  getSessions,
} from './actions';
import { AnamnesisForm } from './anamnesis-form';
import { EvaluationsTab } from './evaluations-tab';
import { SessionsTab } from './sessions-tab';
import { EpisodeForm } from './episode-form';
import type {
  CareEpisodeRecord,
  ClinicalHistoryRecord,
  EvaluationRecord,
  PatientHistoryPatient,
  SessionRecord,
} from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  User,
  FileText,
  Activity,
  NotebookPen,
  AlertCircle,
  Phone,
  Calendar,
  BriefcaseMedical,
  Plus,
  Pencil,
  CheckCircle2,
  ClipboardList,
  Stethoscope,
} from 'lucide-react';

export default function PatientHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<PatientHistoryPatient | null>(null);
  const [history, setHistory] = useState<ClinicalHistoryRecord | null>(null);
  const [episodes, setEpisodes] = useState<CareEpisodeRecord[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const [episodeFormOpen, setEpisodeFormOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<CareEpisodeRecord | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [patData, histData, episodesData, evalsData, sessData] = await Promise.all([
          getPatientById(patientId),
          getClinicalHistory(patientId),
          getCareEpisodes(patientId),
          getEvaluations(patientId),
          getSessions(patientId),
        ]);

        setPatient(patData);
        setHistory(histData);
        setEpisodes(episodesData);
        setEvaluations(evalsData);
        setSessions(sessData);
        setSelectedEpisodeId((current) => {
          if (current && episodesData.some((episode: CareEpisodeRecord) => episode.id === current)) {
            return current;
          }
          return episodesData.find((episode: CareEpisodeRecord) => episode.status === CareEpisodeStatus.ACTIVE)?.id
            ?? episodesData[0]?.id
            ?? null;
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    if (patientId) {
      loadData();
    }
  }, [patientId]);

  const selectedEpisode = useMemo(
    () => episodes.find((episode) => episode.id === selectedEpisodeId) ?? null,
    [episodes, selectedEpisodeId]
  );

  const episodeEvaluations = useMemo(
    () => evaluations.filter((evaluation) => evaluation.episodeId === selectedEpisodeId),
    [evaluations, selectedEpisodeId]
  );

  const episodeSessions = useMemo(
    () => sessions.filter((session) => session.episodeId === selectedEpisodeId),
    [sessions, selectedEpisodeId]
  );

  const workflowSummary = useMemo(() => {
    if (!selectedEpisode) {
      return null;
    }

    const hasInitialEvaluation = episodeEvaluations.some((item) => item.type === 'INIT');
    const hasFollowUpEvaluation = episodeEvaluations.some((item) => item.type === 'FOLLOW_UP');
    const hasDischargeEvaluation = episodeEvaluations.some((item) => item.type === 'DISCHARGE');
    const hasPlan = Boolean(selectedEpisode.kinesicDiagnosis?.trim())
      && Boolean(selectedEpisode.treatmentGoals?.trim())
      && Boolean(selectedEpisode.treatmentPlan?.trim());

    const steps = [
      {
        label: 'Evaluación inicial',
        done: hasInitialEvaluation,
      },
      {
        label: 'Plan terapéutico',
        done: hasPlan,
      },
      {
        label: 'Sesiones',
        done: episodeSessions.length > 0,
      },
      {
        label: 'Reevaluación',
        done: hasFollowUpEvaluation,
      },
      {
        label: 'Alta',
        done: hasDischargeEvaluation || selectedEpisode.status === CareEpisodeStatus.DISCHARGED,
      },
    ];

    return {
      steps,
      currentStage:
        steps.find((step) => !step.done)?.label ?? 'Episodio cerrado',
    };
  }, [selectedEpisode, episodeEvaluations, episodeSessions]);

  const refreshClinicalData = async () => {
    const [episodesData, evalsData, sessData] = await Promise.all([
      getCareEpisodes(patientId),
      getEvaluations(patientId),
      getSessions(patientId),
    ]);

    setEpisodes(episodesData);
    setEvaluations(evalsData);
    setSessions(sessData);
    setSelectedEpisodeId((current) => {
      if (current && episodesData.some((episode: CareEpisodeRecord) => episode.id === current)) {
        return current;
      }

      return episodesData.find((episode: CareEpisodeRecord) => episode.status === CareEpisodeStatus.ACTIVE)?.id
        ?? episodesData[0]?.id
        ?? null;
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">
            Cargando expediente clínico...
          </p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Paciente no encontrado
          </h2>
          <Button variant="link" onClick={() => router.back()} className="mt-4">
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  // Determine critical alerts easily
  const hasAlerts = history?.alerts && history.alerts.trim().length > 0;

  let ageLabel = 'N/A';
  if (patient.dateOfBirth) {
    const ageDiffMs = Date.now() - new Date(patient.dateOfBirth).getTime();
    const ageDate = new Date(ageDiffMs);
    ageLabel = Math.abs(ageDate.getUTCFullYear() - 1970) + ' años';
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Sticky Header con Back Button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50 mb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-muted/80 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Patient Header Summary - Mejorado */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-card via-card to-muted/20 shadow-lg">
            {hasAlerts && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
            )}

            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-4 ring-primary/10">
                    <User className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                  </div>
                  {hasAlerts && (
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center ring-4 ring-background">
                      <AlertCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Info Principal */}
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                      {patient.firstName} {patient.lastName}
                    </h1>
                    {hasAlerts && (
                      <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>ALERTA MÉDICA ACTIVA</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-muted/80 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">DNI</p>
                        <p className="font-medium text-foreground">
                          {patient.dni}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-muted/80 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Edad</p>
                        <p className="font-medium text-foreground">
                          {ageLabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-muted/80 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Teléfono
                        </p>
                        <p className="font-medium text-foreground">
                          {patient.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BriefcaseMedical className="h-5 w-5 text-primary" />
                    Episodios de atención
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingEpisode(null);
                      setEpisodeFormOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nuevo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {episodes.length > 0 ? (
                  <>
                    <Select
                      value={selectedEpisodeId ?? undefined}
                      onValueChange={setSelectedEpisodeId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar episodio" />
                      </SelectTrigger>
                      <SelectContent>
                        {episodes.map((episode) => (
                          <SelectItem key={episode.id} value={episode.id}>
                            {episode.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedEpisode && (
                      <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">
                              {selectedEpisode.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {selectedEpisode.focusArea || 'Sin zona definida'}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {selectedEpisode.status === CareEpisodeStatus.ACTIVE
                              ? 'Activo'
                              : selectedEpisode.status === CareEpisodeStatus.ON_HOLD
                                ? 'En pausa'
                                : selectedEpisode.status === CareEpisodeStatus.DISCHARGED
                                  ? 'Alta'
                                  : 'Cancelado'}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            Inicio:{' '}
                            <span className="text-foreground">
                              {new Date(selectedEpisode.startDate).toLocaleDateString('es-AR')}
                            </span>
                          </p>
                          <p>
                            Evaluaciones:{' '}
                            <span className="text-foreground">{episodeEvaluations.length}</span>
                          </p>
                          <p>
                            Sesiones:{' '}
                            <span className="text-foreground">{episodeSessions.length}</span>
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setEditingEpisode(selectedEpisode);
                            setEpisodeFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar episodio
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center">
                    <p className="font-medium text-foreground">
                      Todavía no hay episodios clínicos
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Crea un episodio para separar una atención por esguince,
                      desgarro u otro motivo clínico independiente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Flujo del episodio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedEpisode || !workflowSummary ? (
                  <p className="text-sm text-muted-foreground">
                    Selecciona un episodio para visualizar su circuito clínico.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2 text-sm">
                      Etapa actual:{' '}
                      <span className="font-medium text-foreground">
                        {workflowSummary.currentStage}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {workflowSummary.steps.map((step) => (
                        <div
                          key={step.label}
                          className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                        >
                          <span className="text-sm text-foreground">{step.label}</span>
                          <Badge variant={step.done ? 'success' : 'outline'}>
                            {step.done ? 'Completo' : 'Pendiente'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs Layout - Mejorado */}
          <Tabs defaultValue="anamnesis" className="w-full flex flex-col">
          {/* Fila Superior: TabsList Sticky */}
          <div className="sticky top-[73px] z-20 bg-background/95 backdrop-blur-lg border-b border-border/50 -mx-4 sm:-mx-6 lg:mx-0 lg:px-0 px-4 sm:px-6 py-4 mb-6">
            <TabsList className="inline-flex h-auto w-full sm:w-auto p-1 bg-muted/50 rounded-xl shadow-sm">
              <TabsTrigger
                value="anamnesis"
                className="flex-1 sm:flex-none rounded-lg px-4 py-2.5 data-active:bg-background data-active:shadow-md transition-all"
              >
                <FileText className="w-4 h-4 mr-2 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">
                  Historia General
                </span>
                <span className="sm:hidden">General</span>
              </TabsTrigger>

              <TabsTrigger
                value="episode"
                className="flex-1 sm:flex-none rounded-lg px-4 py-2.5 data-active:bg-background data-active:shadow-md transition-all"
              >
                <ClipboardList className="w-4 h-4 mr-2 shrink-0" />
                <span className="whitespace-nowrap">Episodio</span>
              </TabsTrigger>

              <TabsTrigger
                value="evaluations"
                className="flex-1 sm:flex-none rounded-lg px-4 py-2.5 data-active:bg-background data-active:shadow-md transition-all"
              >
                <Activity className="w-4 h-4 mr-2 shrink-0" />
                <span className="whitespace-nowrap">Evaluaciones</span>
              </TabsTrigger>

              <TabsTrigger
                value="sessions"
                className="flex-1 sm:flex-none rounded-lg px-4 py-2.5 data-active:bg-background data-active:shadow-md transition-all"
              >
                <NotebookPen className="w-4 h-4 mr-2 shrink-0" />
                <span className="whitespace-nowrap">Evolución</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Fila Inferior: Contenido de los Tabs */}
          <div className="w-full flex-1">
            <TabsContent
              value="anamnesis"
              className="m-0 focus-visible:outline-none"
            >
              <AnamnesisForm patientId={patientId} initialData={history} />
            </TabsContent>

            <TabsContent
              value="episode"
              className="m-0 focus-visible:outline-none"
            >
              {selectedEpisode ? (
                <div className="space-y-6 pb-24">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-primary" />
                        Resumen del episodio activo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Motivo de consulta</p>
                          <p className="mt-1 text-sm text-foreground">
                            {selectedEpisode.chiefComplaint || 'No registrado'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Condición actual</p>
                          <p className="mt-1 text-sm text-foreground">
                            {selectedEpisode.currentCondition || 'No registrada'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Diagnóstico kinésico</p>
                          <p className="mt-1 text-sm text-foreground">
                            {selectedEpisode.kinesicDiagnosis || 'No registrado'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Objetivos terapéuticos</p>
                          <p className="mt-1 text-sm text-foreground">
                            {selectedEpisode.treatmentGoals || 'No registrados'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Plan terapéutico</p>
                        <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                          {selectedEpisode.treatmentPlan || 'No definido'}
                        </p>
                      </div>

                      {selectedEpisode.dischargeSummary && (
                        <div>
                          <p className="text-sm text-muted-foreground">Resumen de alta</p>
                          <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                            {selectedEpisode.dischargeSummary}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center text-muted-foreground">
                    Crea o selecciona un episodio para trabajar su circuito clínico.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent
              value="evaluations"
              className="m-0 focus-visible:outline-none"
            >
              <EvaluationsTab
                patientId={patientId}
                episodeId={selectedEpisodeId}
                episodeTitle={selectedEpisode?.title}
                evaluations={episodeEvaluations}
              />
            </TabsContent>

            <TabsContent
              value="sessions"
              className="m-0 focus-visible:outline-none"
            >
              <SessionsTab
                patientId={patientId}
                episodeId={selectedEpisodeId}
                episodeTitle={selectedEpisode?.title}
                sessions={episodeSessions}
              />
            </TabsContent>
          </div>
        </Tabs>
        </div>
      </div>

      <EpisodeForm
        open={episodeFormOpen}
        onOpenChange={setEpisodeFormOpen}
        patientId={patientId}
        episode={editingEpisode}
        onSaved={refreshClinicalData}
      />
    </div>
  );
}
