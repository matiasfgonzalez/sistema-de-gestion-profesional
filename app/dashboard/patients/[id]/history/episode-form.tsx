'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CareEpisodeStatus } from '@prisma/client';
import {
  careEpisodeSchema,
  type CareEpisodeFormInput,
  type CareEpisodeValues,
} from '@/lib/validations/clinical';
import { createCareEpisode, updateCareEpisode } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { CareEpisodeRecord } from './types';

interface EpisodeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  episode?: CareEpisodeRecord | null;
  onSaved?: () => void;
}

export function EpisodeForm({
  open,
  onOpenChange,
  patientId,
  episode,
  onSaved,
}: EpisodeFormProps) {
  const isEditing = Boolean(episode);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<CareEpisodeFormInput, unknown, CareEpisodeValues>({
    resolver: zodResolver(careEpisodeSchema),
    defaultValues: {
      title: '',
      focusArea: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: CareEpisodeStatus.ACTIVE,
      chiefComplaint: '',
      currentCondition: '',
      kinesicDiagnosis: '',
      treatmentGoals: '',
      treatmentPlan: '',
      dischargeSummary: '',
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (episode) {
      reset({
        title: episode.title || '',
        focusArea: episode.focusArea || '',
        startDate: new Date(episode.startDate).toISOString().split('T')[0],
        endDate: episode.endDate
          ? new Date(episode.endDate).toISOString().split('T')[0]
          : '',
        status: episode.status,
        chiefComplaint: episode.chiefComplaint || '',
        currentCondition: episode.currentCondition || '',
        kinesicDiagnosis: episode.kinesicDiagnosis || '',
        treatmentGoals: episode.treatmentGoals || '',
        treatmentPlan: episode.treatmentPlan || '',
        dischargeSummary: episode.dischargeSummary || '',
      });
      return;
    }

    reset({
      title: '',
      focusArea: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: CareEpisodeStatus.ACTIVE,
      chiefComplaint: '',
      currentCondition: '',
      kinesicDiagnosis: '',
      treatmentGoals: '',
      treatmentPlan: '',
      dischargeSummary: '',
    });
  }, [episode, open, reset]);

  const onSubmit = async (data: CareEpisodeValues) => {
    try {
      if (isEditing && episode) {
        await updateCareEpisode(episode.id, patientId, data);
        toast.success('Episodio actualizado correctamente');
      } else {
        await createCareEpisode(patientId, data);
        toast.success('Episodio creado correctamente');
      }

      onSaved?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo guardar el episodio clínico');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar episodio clínico' : 'Nuevo episodio clínico'}
          </DialogTitle>
          <DialogDescription>
            Define un problema o motivo de atención independiente dentro de la
            historia clínica del paciente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Nombre del episodio *</Label>
              <Input
                id="title"
                placeholder="Ej. Esguince de tobillo derecho"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="focusArea">Zona / foco clínico</Label>
              <Input
                id="focusArea"
                placeholder="Ej. Tobillo derecho"
                {...register('focusArea')}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de inicio *</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as CareEpisodeStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado del episodio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CareEpisodeStatus.ACTIVE}>Activo</SelectItem>
                      <SelectItem value={CareEpisodeStatus.ON_HOLD}>
                        En pausa
                      </SelectItem>
                      <SelectItem value={CareEpisodeStatus.DISCHARGED}>
                        Alta
                      </SelectItem>
                      <SelectItem value={CareEpisodeStatus.CANCELLED}>
                        Cancelado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de cierre</Label>
              <Input id="endDate" type="date" {...register('endDate')} />
              {errors.endDate && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">Motivo de consulta del episodio</Label>
            <Textarea
              id="chiefComplaint"
              rows={3}
              className="resize-none"
              placeholder="Describe el motivo puntual por el que inicia este episodio"
              {...register('chiefComplaint')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentCondition">Condición actual</Label>
            <Textarea
              id="currentCondition"
              rows={3}
              className="resize-none"
              placeholder="Síntomas, limitaciones funcionales, dolor, evolución inicial"
              {...register('currentCondition')}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kinesicDiagnosis">Diagnóstico kinésico</Label>
              <Textarea
                id="kinesicDiagnosis"
                rows={4}
                className="resize-none"
                placeholder="Diagnóstico funcional del episodio"
                {...register('kinesicDiagnosis')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatmentGoals">Objetivos terapéuticos</Label>
              <Textarea
                id="treatmentGoals"
                rows={4}
                className="resize-none"
                placeholder="Metas a corto y largo plazo"
                {...register('treatmentGoals')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatmentPlan">Plan terapéutico</Label>
            <Textarea
              id="treatmentPlan"
              rows={4}
              className="resize-none"
              placeholder="Frecuencia, técnicas, estrategia de tratamiento"
              {...register('treatmentPlan')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dischargeSummary">Resumen de alta / cierre</Label>
            <Textarea
              id="dischargeSummary"
              rows={3}
              className="resize-none"
              placeholder="Conclusiones clínicas, recomendaciones y condición al alta"
              {...register('dischargeSummary')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear episodio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
