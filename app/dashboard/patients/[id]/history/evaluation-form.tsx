"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { evaluationSchema, type EvaluationValues } from "@/lib/validations/clinical";
import { createEvaluation, deleteEvaluation } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

interface EvaluationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  evaluation?: any | null;
}

export function EvaluationForm({ open, onOpenChange, patientId, evaluation }: EvaluationFormProps) {
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
      type: "FOLLOW_UP",
      painScale: "",
      subjective: "",
      objectivePosture: "",
      objectiveGait: "",
      objectiveROM: "",
      objectiveStrength: "",
      specialTests: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (evaluation) {
        reset({
          type: evaluation.type,
          painScale: evaluation.painScale !== null ? evaluation.painScale : "",
          subjective: evaluation.subjective || "",
          objectivePosture: evaluation.objectivePosture || "",
          objectiveGait: evaluation.objectiveGait || "",
          objectiveROM: evaluation.objectiveROM || "",
          objectiveStrength: evaluation.objectiveStrength || "",
          specialTests: evaluation.specialTests || "",
        });
      } else {
        reset({
          type: "FOLLOW_UP",
          painScale: "",
          subjective: "",
          objectivePosture: "",
          objectiveGait: "",
          objectiveROM: "",
          objectiveStrength: "",
          specialTests: "",
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
        toast.success("Evaluación actualizada correctamente");
      } else {
        await createEvaluation(patientId, data);
        toast.success("Evaluación guardada exitosamente");
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error("Error al procesar evaluación");
    }
  };

  const attemptDelete = async () => {
    if (!evaluation || !window.confirm("¿Seguro que deseas eliminar esta evaluación médica irreversiblemente?")) return;
    try {
      await deleteEvaluation(evaluation.id, patientId);
      toast.success("Evaluación eliminada");
      onOpenChange(false);
    } catch (error) {
      toast.error("Error el eliminar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Detalle / Editar Evaluación" : "Nueva Evaluación Médica"}</DialogTitle>
          <DialogDescription>
            Registra los hallazgos objetivos y subjetivos del paciente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-2">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Evaluación</Label>
              <Select
                value={watch("type")}
                onValueChange={(val: any) => setValue("type", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INIT">Evaluación Inicial</SelectItem>
                  <SelectItem value="FOLLOW_UP">Re-evaluación (Seguimiento)</SelectItem>
                  <SelectItem value="DISCHARGE">Alta Kinesiológica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="painScale">Escala de Dolor (EVA 0-10)</Label>
              <Input id="painScale" type="number" min="0" max="10" {...register("painScale")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjective">Evaluación Subjetiva (Lo que el paciente siente)</Label>
            <Textarea id="subjective" {...register("subjective")} rows={2} placeholder="Descripción de síntomas, dolor, mejora..." />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground border-b border-border pb-1">Evaluación Objetiva</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="objectivePosture">Postura y Estática</Label>
                <Textarea id="objectivePosture" {...register("objectivePosture")} rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="objectiveGait">Marcha y Dinámica</Label>
                <Textarea id="objectiveGait" {...register("objectiveGait")} rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="objectiveROM">Rangos de Movimiento (ROM)</Label>
                <Textarea id="objectiveROM" {...register("objectiveROM")} rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="objectiveStrength">Fuerza Muscular (1-5)</Label>
                <Textarea id="objectiveStrength" {...register("objectiveStrength")} rows={2} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialTests">Tests Ortopédicos / Pruebas Especiales</Label>
            <Textarea id="specialTests" {...register("specialTests")} rows={2} />
          </div>

          <DialogFooter className="flex justify-between items-center sm:justify-between">
            {isEditing ? (
               <Button type="button" variant="ghost" className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 p-2" onClick={attemptDelete}>
                 <Trash2 className="w-4 h-4 mr-2" /> Borrar
               </Button>
            ) : <div/>}
            <div className="flex gap-2">
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                 Cerrar
               </Button>
               <Button type="submit" disabled={isSubmitting}>
                 {isEditing ? "Actualizar Evaluación" : "Guardar Evaluación"}
               </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
