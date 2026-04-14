"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPatientById } from "../../actions";
import { getClinicalHistory, getEvaluations, getSessions } from "./actions";
import { AnamnesisForm } from "./anamnesis-form";
import { EvaluationsTab } from "./evaluations-tab";
import { SessionsTab } from "./sessions-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, FileText, Activity, NotebookPen } from "lucide-react";

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
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
         <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
         Cargando expediente digital...
      </div>
    );
  }

  if (!patient) {
    return <div>Paciente no encontrado</div>;
  }

  // Determine critical alerts easily
  const hasAlerts = history?.alerts && history.alerts.trim().length > 0;

  let ageLabel = "N/A";
  if (patient.dateOfBirth) {
    const ageDiffMs = Date.now() - new Date(patient.dateOfBirth).getTime();
    const ageDate = new Date(ageDiffMs);
    ageLabel = Math.abs(ageDate.getUTCFullYear() - 1970) + " años";
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Back Button */}
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver
      </Button>

      {/* Patient Header Summary */}
      <div className="bg-background-card rounded-2xl border border-border p-5 md:p-6 mb-8 flex flex-col md:flex-row gap-6 md:items-center shadow-sm">
        <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="h-8 w-8 md:h-10 md:w-10 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-bold text-foreground">
               {patient.firstName} {patient.lastName}
             </h1>
             {hasAlerts && (
               <span className="bg-danger-100 text-danger-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">
                 Alerta Médica
               </span>
             )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span>DNI: {patient.dni}</span>
            <span>Edad: {ageLabel}</span>
            <span>Tel: {patient.phone}</span>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="anamnesis" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="anamnesis" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
             <FileText className="w-4 h-4 mr-2" />
             <span className="hidden sm:inline">Anamnesis / Historial</span>
             <span className="sm:hidden">General</span>
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
             <Activity className="w-4 h-4 mr-2" />
             Evaluaciones
          </TabsTrigger>
          <TabsTrigger value="sessions" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
             <NotebookPen className="w-4 h-4 mr-2" />
             Evolución
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="anamnesis" className="m-0 focus-visible:outline-none">
            <AnamnesisForm patientId={patientId} initialData={history} />
          </TabsContent>
          
          <TabsContent value="evaluations" className="m-0 focus-visible:outline-none">
            <EvaluationsTab patientId={patientId} evaluations={evaluations} />
          </TabsContent>
          
          <TabsContent value="sessions" className="m-0 focus-visible:outline-none">
            <SessionsTab patientId={patientId} sessions={sessions} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
