'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  clinicalHistorySchema,
  type ClinicalHistoryValues,
} from '@/lib/validations/clinical';
import { updateClinicalHistory } from './actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Save,
  AlertTriangle,
  Stethoscope,
  User,
  Target,
  ClipboardList,
} from 'lucide-react';
import type { ClinicalHistoryRecord } from './types';

interface AnamnesisFormProps {
  patientId: string;
  initialData: ClinicalHistoryRecord | null;
}

export function AnamnesisForm({ patientId, initialData }: AnamnesisFormProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ClinicalHistoryValues>({
    resolver: zodResolver(clinicalHistorySchema),
    defaultValues: {
      reasonForConsultation: initialData?.reasonForConsultation || '',
      currentIllness: initialData?.currentIllness || '',
      personalHistory: initialData?.personalHistory || '',
      familyHistory: initialData?.familyHistory || '',
      habits: initialData?.habits || '',
      alerts: initialData?.alerts || '',
      kinesicDiagnosis: initialData?.kinesicDiagnosis || '',
      treatmentGoals: initialData?.treatmentGoals || '',
      treatmentPlan: initialData?.treatmentPlan || '',
    },
  });

  const onSubmit = async (data: ClinicalHistoryValues) => {
    try {
      await updateClinicalHistory(patientId, data);
      toast.success('Historial guardado exitosamente');
    } catch {
      toast.error('Error al guardar el historial');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
      {/* Alertas Médicas - Destacadas */}
      <Card className="border-red-200 dark:border-red-900/50 bg-linear-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-red-900 dark:text-red-100">
                Alertas Importantes
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                Alergias, contraindicaciones y riesgos médicos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="alerts" className="sr-only">
              Alertas Importantes
            </Label>
            <Textarea
              id="alerts"
              {...register('alerts')}
              placeholder="Ej: Alérgico al látex, marcapasos, hipertensión severa..."
              className="bg-white dark:bg-neutral-900 border-red-200 dark:border-red-900/50 focus:border-red-500 dark:focus:border-red-500 min-h-20 resize-none"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Motivo y Enfermedad Actual */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Contexto Clínico General
                </CardTitle>
                <CardDescription>
                  Información transversal del paciente. Los problemas puntuales se registran por episodio.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="reasonForConsultation"
                className="text-sm font-medium"
              >
                Motivo general de consulta
              </Label>
              <Textarea
                id="reasonForConsultation"
                {...register('reasonForConsultation')}
                placeholder="Resumen general del tipo de consultas o antecedentes funcionales"
                className="resize-none min-h-20"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentIllness" className="text-sm font-medium">
                Situación clínica de base
              </Label>
              <p className="text-xs text-muted-foreground">
                Contexto general útil para futuras atenciones
              </p>
              <Textarea
                id="currentIllness"
                {...register('currentIllness')}
                placeholder="Descripción detallada del problema actual..."
                className="resize-none"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Antecedentes y Hábitos
                </CardTitle>
                <CardDescription>Contexto previo del paciente</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personalHistory" className="text-sm font-medium">
                Personales
              </Label>
              <p className="text-xs text-muted-foreground">
                Cirugías, medicación, lesiones previas
              </p>
              <Textarea
                id="personalHistory"
                {...register('personalHistory')}
                placeholder="Ej: Operación de menisco en 2020..."
                className="resize-none"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="familyHistory" className="text-sm font-medium">
                Familiares
              </Label>
              <p className="text-xs text-muted-foreground">
                Enfermedades relevantes
              </p>
              <Textarea
                id="familyHistory"
                {...register('familyHistory')}
                placeholder="Ej: Diabetes, hipertensión familiar..."
                className="resize-none"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="habits" className="text-sm font-medium">
                Hábitos
              </Label>
              <p className="text-xs text-muted-foreground">
                Trabajo, deportes, sedentarismo, posturas
              </p>
              <Textarea
                id="habits"
                {...register('habits')}
                placeholder="Ej: Trabaja 8hs sentado, practica running..."
                className="resize-none"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diagnóstico y Plan Kinésico */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg">
                  Criterio clínico global
              </CardTitle>
              <CardDescription>
                Notas de referencia general. El plan específico se define por episodio.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="kinesicDiagnosis" className="text-sm font-medium">
              Diagnóstico funcional global
            </Label>
            <Textarea
              id="kinesicDiagnosis"
              {...register('kinesicDiagnosis')}
              placeholder="Ej: Disfunción lumbar con restricción de movilidad..."
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <Label htmlFor="treatmentGoals" className="text-sm font-medium">
                  Objetivos globales
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Metas a corto y largo plazo
              </p>
              <Textarea
                id="treatmentGoals"
                {...register('treatmentGoals')}
                placeholder="Ej: Reducir dolor, mejorar movilidad..."
                className="resize-none"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                <Label htmlFor="treatmentPlan" className="text-sm font-medium">
                  Lineamientos terapéuticos generales
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Técnicas y frecuencia
              </p>
              <Textarea
                id="treatmentPlan"
                {...register('treatmentPlan')}
                placeholder="Ej: 2 sesiones semanales, magnetoterapia..."
                className="resize-none"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón Guardar - Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 backdrop-blur-lg shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-end max-w-7xl mx-auto">
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="min-w-48 shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Guardando...' : 'Guardar Historial Clínico'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
