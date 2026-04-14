'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPatientById } from '../../actions';
import { getClinicalHistory, getEvaluations, getSessions } from './actions';
import { AnamnesisForm } from './anamnesis-form';
import { EvaluationsTab } from './evaluations-tab';
import { SessionsTab } from './sessions-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  User,
  FileText,
  Activity,
  NotebookPen,
  AlertCircle,
  Phone,
  Calendar,
} from 'lucide-react';

export default function PatientHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [patData, histData, evalsData, sessData] = await Promise.all([
          getPatientById(patientId),
          getClinicalHistory(patientId),
          getEvaluations(patientId),
          getSessions(patientId),
        ]);

        setPatient(patData);
        setHistory(histData);
        setEvaluations(evalsData);
        setSessions(sessData);
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

        {/* Tabs Layout - Mejorado */}
        <Tabs defaultValue="anamnesis" className="w-full flex flex-col">
          {/* Fila Superior: TabsList Sticky */}
          <div className="sticky top-[73px] z-20 bg-background/95 backdrop-blur-lg border-b border-border/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-6">
            <TabsList className="inline-flex h-auto w-full sm:w-auto p-1 bg-muted/50 rounded-xl shadow-sm">
              <TabsTrigger
                value="anamnesis"
                className="flex-1 sm:flex-none rounded-lg px-4 py-2.5 data-active:bg-background data-active:shadow-md transition-all"
              >
                <FileText className="w-4 h-4 mr-2 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">
                  Anamnesis / Historial
                </span>
                <span className="sm:hidden">Historial</span>
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
              value="evaluations"
              className="m-0 focus-visible:outline-none"
            >
              <EvaluationsTab patientId={patientId} evaluations={evaluations} />
            </TabsContent>

            <TabsContent
              value="sessions"
              className="m-0 focus-visible:outline-none"
            >
              <SessionsTab patientId={patientId} sessions={sessions} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
