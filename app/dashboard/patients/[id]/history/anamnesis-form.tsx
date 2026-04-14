"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clinicalHistorySchema, type ClinicalHistoryValues } from "@/lib/validations/clinical";
import { updateClinicalHistory } from "./actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save } from "lucide-react";

interface AnamnesisFormProps {
  patientId: string;
  initialData: any;
}

export function AnamnesisForm({ patientId, initialData }: AnamnesisFormProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ClinicalHistoryValues>({
    resolver: zodResolver(clinicalHistorySchema),
    defaultValues: {
      reasonForConsultation: initialData.reasonForConsultation || "",
      currentIllness: initialData.currentIllness || "",
      personalHistory: initialData.personalHistory || "",
      familyHistory: initialData.familyHistory || "",
      habits: initialData.habits || "",
      alerts: initialData.alerts || "",
      kinesicDiagnosis: initialData.kinesicDiagnosis || "",
      treatmentGoals: initialData.treatmentGoals || "",
      treatmentPlan: initialData.treatmentPlan || "",
    },
  });

  const onSubmit = async (data: ClinicalHistoryValues) => {
    try {
      await updateClinicalHistory(patientId, data);
      toast.success("Historial guardado exitosamente");
    } catch (error) {
      toast.error("Error al guardar el historial");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Alertas rojas */}
      <Card className="border-danger-200 bg-danger-50 dark:bg-danger-950/20">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="alerts" className="text-danger-800 dark:text-danger-400 font-bold">
              Alertas Importantes (Alergias, Contraindicaciones, Riesgos)
            </Label>
            <Textarea 
              id="alerts" 
              {...register("alerts")} 
              placeholder="Ej: Alérgico al látex, marcapasos, hipertensión severa..." 
              className="bg-background border-danger-200"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Motivo y Enfermedad Actual</CardTitle>
            <CardDescription>Exploración del dolor y la limitación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reasonForConsultation">Motivo Principal de Consulta</Label>
              <Textarea id="reasonForConsultation" {...register("reasonForConsultation")} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentIllness">Qué lo trae a tratamiento (Dolor, EVA, lesión específica)</Label>
              <Textarea id="currentIllness" {...register("currentIllness")} rows={4} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Antecedentes y Hábitos</CardTitle>
            <CardDescription>Contexto previo del paciente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personalHistory">Personales (Cirugías, Medicación, Lesiones previas)</Label>
              <Textarea id="personalHistory" {...register("personalHistory")} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="familyHistory">Familiares (Enfermedades relevantes)</Label>
              <Textarea id="familyHistory" {...register("familyHistory")} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="habits">Hábitos (Trabajo, Deportes, Sedentarismo, Posturas)</Label>
              <Textarea id="habits" {...register("habits")} rows={2} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico y Plan Kinésico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kinesicDiagnosis">Diagnóstico Kinésico Funcional</Label>
            <Textarea id="kinesicDiagnosis" {...register("kinesicDiagnosis")} placeholder="Ej: Disfunción lumbar con restricción de movilidad..." rows={2} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
             <div className="space-y-2">
                <Label htmlFor="treatmentGoals">Objetivos del Tratamiento (Corto / Largo plazo)</Label>
                <Textarea id="treatmentGoals" {...register("treatmentGoals")} rows={3} />
             </div>
             <div className="space-y-2">
                <Label htmlFor="treatmentPlan">Plan de Tratamiento (Técnicas, Frecuencia)</Label>
                <Textarea id="treatmentPlan" {...register("treatmentPlan")} rows={3} />
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end sticky bottom-6 z-10 w-full py-4 bg-background/80 backdrop-blur-sm border-t border-border">
        <Button type="submit" disabled={isSubmitting} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? "Guardando..." : "Guardar Historial Clínico"}
        </Button>
      </div>
    </form>
  );
}
