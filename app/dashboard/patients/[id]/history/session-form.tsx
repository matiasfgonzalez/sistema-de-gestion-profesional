'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  sessionEvolutionSchema,
  type SessionEvolutionFormInput,
  type SessionEvolutionValues,
} from '@/lib/validations/clinical';
import { createSession, deleteSession, updateSession } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';

interface SessionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  sessionInfo?: any | null;
}

export function SessionForm({
  open,
  onOpenChange,
  patientId,
  sessionInfo,
}: SessionFormProps) {
  const isEditing = !!sessionInfo;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SessionEvolutionFormInput, unknown, SessionEvolutionValues>({
    resolver: zodResolver(sessionEvolutionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      duration: 60,
      treatmentType: '',
      painLevel: '',
      patientState: '',
      progressMetrics: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (sessionInfo) {
        reset({
          date: new Date(sessionInfo.date).toISOString().split('T')[0],
          startTime: sessionInfo.startTime || '',
          duration: sessionInfo.duration || 60,
          treatmentType: sessionInfo.treatmentType || '',
          painLevel:
            sessionInfo.painLevel !== null ? sessionInfo.painLevel : '',
          patientState: sessionInfo.patientState || '',
          progressMetrics: sessionInfo.progressMetrics || '',
          notes: sessionInfo.notes || '',
        });
      } else {
        reset({
          date: new Date().toISOString().split('T')[0], // default hoy
          startTime: '',
          duration: 60,
          treatmentType: '',
          painLevel: '',
          patientState: '',
          progressMetrics: '',
          notes: '',
        });
      }
    }
  }, [open, sessionInfo, reset]);

  const onSubmit = async (data: SessionEvolutionValues) => {
    try {
      if (isEditing) {
        await updateSession(sessionInfo.id, patientId, data);
        toast.success('Sesión actualizada correctamente');
      } else {
        await createSession(patientId, data);
        toast.success('Sesión registrada exitosamente');
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error('Error al procesar sesión');
    }
  };

  const attemptDelete = async () => {
    if (
      !sessionInfo ||
      !window.confirm('¿Seguro que deseas eliminar esta evolución de sesión?')
    )
      return;
    try {
      await deleteSession(sessionInfo.id, patientId);
      toast.success('Sesión eliminada');
      onOpenChange(false);
    } catch (error) {
      toast.error('Error el eliminar');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {isEditing
              ? 'Detalle de Sesión'
              : 'Registrar Nueva Sesión / Evolución'}
          </DialogTitle>
          <DialogDescription className="text-base">
            Documenta el tratamiento realizado y el progreso del paciente en
            esta sesión.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold">
                Fecha *
              </Label>
              <Input
                id="date"
                type="date"
                className="h-11"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.date.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-semibold">
                Duración (min) *
              </Label>
              <Input
                id="duration"
                type="number"
                className="h-11"
                placeholder="60"
                {...register('duration')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="painLevel" className="text-sm font-semibold">
                Dolor (EVA 0-10)
              </Label>
              <Input
                id="painLevel"
                type="number"
                min="0"
                max="10"
                className="h-11"
                placeholder="0-10"
                {...register('painLevel')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="patientState"
              className="text-sm font-semibold flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-primary" />
              Estado Subjetivo
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              ¿Cómo llegó el paciente hoy?
            </p>
            <Input
              id="patientState"
              {...register('patientState')}
              className="h-11"
              placeholder="Mejoría del dolor, molestias post-sesión anterior..."
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="treatmentType"
              className="text-sm font-semibold flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Tratamiento y Técnicas Aplicadas *
            </Label>
            <Textarea
              id="treatmentType"
              {...register('treatmentType')}
              placeholder="Magnetoterapia, masajes descontracturantes, ejercicios propioceptivos..."
              rows={4}
              className="resize-none"
            />
            {errors.treatmentType && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.treatmentType.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="progressMetrics" className="text-sm font-semibold">
              Progreso y Mediciones
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              ROM, fuerza, mejoras observadas
            </p>
            <Textarea
              id="progressMetrics"
              {...register('progressMetrics')}
              placeholder="Logra flexión completa, camina 10 min sin dolor..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold">
              Observaciones Generales
            </Label>
            <Textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="resize-none"
              placeholder="Notas adicionales sobre la sesión..."
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6 border-t border-border">
            {isEditing ? (
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={attemptDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Sesión
              </Button>
            ) : (
              <div className="hidden sm:block" />
            )}
            <div className="flex gap-3 flex-col-reverse sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto min-w-40"
              >
                {isEditing ? 'Actualizar' : 'Guardar Evolución'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
