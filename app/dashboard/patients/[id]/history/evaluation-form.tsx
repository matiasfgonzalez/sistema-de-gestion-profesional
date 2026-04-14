'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  evaluationSchema,
  type EvaluationValues,
} from '@/lib/validations/clinical';
import { createEvaluation, deleteEvaluation } from './actions';
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

interface EvaluationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  evaluation?: any | null;
}

export function EvaluationForm({
  open,
  onOpenChange,
  patientId,
  evaluation,
}: EvaluationFormProps) {
  const isEditing = !!evaluation;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<EvaluationValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      type: 'FOLLOW_UP',
      painScale: '',
      subjective: '',
      objectivePosture: '',
      objectiveGait: '',
      objectiveROM: '',
      objectiveStrength: '',
      specialTests: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (evaluation) {
        reset({
          type: evaluation.type,
          painScale: evaluation.painScale !== null ? evaluation.painScale : '',
          subjective: evaluation.subjective || '',
          objectivePosture: evaluation.objectivePosture || '',
          objectiveGait: evaluation.objectiveGait || '',
          objectiveROM: evaluation.objectiveROM || '',
          objectiveStrength: evaluation.objectiveStrength || '',
          specialTests: evaluation.specialTests || '',
        });
      } else {
        reset({
          type: 'FOLLOW_UP',
          painScale: '',
          subjective: '',
          objectivePosture: '',
          objectiveGait: '',
          objectiveROM: '',
          objectiveStrength: '',
          specialTests: '',
        });
      }
    }
  }, [open, evaluation, reset]);

  const onSubmit = async (data: EvaluationValues) => {
    try {
      if (isEditing) {
        // En este MVP la reescribimos borrando la vieja y subiendo nueva si está editando para simplificar.
        // O mejor simplemente evitamos edición compleja de historiales para evitar fraude médico, pero permitimos crear.
        // Asumiendo que es read-only la edición en apps medicas estrictas, pero aquí damos flexibilidad.
        await deleteEvaluation(evaluation.id, patientId);
        await createEvaluation(patientId, data);
        toast.success('Evaluación actualizada correctamente');
      } else {
        await createEvaluation(patientId, data);
        toast.success('Evaluación guardada exitosamente');
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error('Error al procesar evaluación');
    }
  };

  const attemptDelete = async () => {
    if (
      !evaluation ||
      !window.confirm(
        '¿Seguro que deseas eliminar esta evaluación médica irreversiblemente?',
      )
    )
      return;
    try {
      await deleteEvaluation(evaluation.id, patientId);
      toast.success('Evaluación eliminada');
      onOpenChange(false);
    } catch (error) {
      toast.error('Error el eliminar');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {isEditing
              ? 'Detalle de Evaluación Médica'
              : 'Nueva Evaluación Médica'}
          </DialogTitle>
          <DialogDescription className="text-base">
            Registra los hallazgos objetivos y subjetivos del paciente para
            seguimiento clínico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-semibold">
                Tipo de Evaluación
              </Label>
              <Select
                value={watch('type')}
                onValueChange={(val: any) => setValue('type', val)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INIT">Evaluación Inicial</SelectItem>
                  <SelectItem value="FOLLOW_UP">
                    Re-evaluación (Seguimiento)
                  </SelectItem>
                  <SelectItem value="DISCHARGE">Alta Kinesiológica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="painScale" className="text-sm font-semibold">
                Escala de Dolor (EVA 0-10)
              </Label>
              <Input
                id="painScale"
                type="number"
                min="0"
                max="10"
                className="h-11"
                placeholder="0-10"
                {...register('painScale')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="subjective"
              className="text-sm font-semibold flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-primary" />
              Evaluación Subjetiva (Lo que el paciente siente)
            </Label>
            <Textarea
              id="subjective"
              {...register('subjective')}
              rows={3}
              className="resize-none"
              placeholder="Descripción de síntomas, dolor, mejora percibida por el paciente..."
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Evaluación Objetiva
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="objectivePosture"
                  className="text-sm font-medium"
                >
                  Postura y Estática
                </Label>
                <Textarea
                  id="objectivePosture"
                  {...register('objectivePosture')}
                  rows={3}
                  className="resize-none"
                  placeholder="Análisis postural..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="objectiveGait" className="text-sm font-medium">
                  Marcha y Dinámica
                </Label>
                <Textarea
                  id="objectiveGait"
                  {...register('objectiveGait')}
                  rows={3}
                  className="resize-none"
                  placeholder="Evaluación de la marcha..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="objectiveROM" className="text-sm font-medium">
                  Rangos de Movimiento (ROM)
                </Label>
                <Textarea
                  id="objectiveROM"
                  {...register('objectiveROM')}
                  rows={3}
                  className="resize-none"
                  placeholder="Grados de movimiento..."
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="objectiveStrength"
                  className="text-sm font-medium"
                >
                  Fuerza Muscular (1-5)
                </Label>
                <Textarea
                  id="objectiveStrength"
                  {...register('objectiveStrength')}
                  rows={3}
                  className="resize-none"
                  placeholder="Balance muscular..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialTests" className="text-sm font-semibold">
              Tests Ortopédicos / Pruebas Especiales
            </Label>
            <Textarea
              id="specialTests"
              {...register('specialTests')}
              rows={3}
              className="resize-none"
              placeholder="Resultados de tests específicos..."
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
                Eliminar Evaluación
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
                {isEditing ? 'Actualizar Evaluación' : 'Guardar Evaluación'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
