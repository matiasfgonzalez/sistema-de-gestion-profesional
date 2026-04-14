"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sessionEvolutionSchema, type SessionEvolutionValues } from "@/lib/validations/clinical";
import { createSession, deleteSession } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface SessionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  sessionInfo?: any | null;
}

export function SessionForm({ open, onOpenChange, patientId, sessionInfo }: SessionFormProps) {
  const isEditing = !!sessionInfo;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SessionEvolutionValues>({
    resolver: zodResolver(sessionEvolutionSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      startTime: "",
      duration: 60,
      treatmentType: "",
      painLevel: "",
      patientState: "",
      progressMetrics: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (sessionInfo) {
        reset({
          date: new Date(sessionInfo.date).toISOString().split("T")[0],
          startTime: sessionInfo.startTime || "",
          duration: sessionInfo.duration || 60,
          treatmentType: sessionInfo.treatmentType || "",
          painLevel: sessionInfo.painLevel !== null ? sessionInfo.painLevel : "",
          patientState: sessionInfo.patientState || "",
          progressMetrics: sessionInfo.progressMetrics || "",
          notes: sessionInfo.notes || "",
        });
      } else {
        reset({
          date: new Date().toISOString().split("T")[0], // default hoy
          startTime: "",
          duration: 60,
          treatmentType: "",
          painLevel: "",
          patientState: "",
          progressMetrics: "",
          notes: "",
        });
      }
    }
  }, [open, sessionInfo, reset]);

  const onSubmit = async (data: SessionEvolutionValues) => {
    try {
      if (isEditing) {
        await deleteSession(sessionInfo.id, patientId);
        await createSession(patientId, data);
        toast.success("Sesión actualizada correctamente");
      } else {
        await createSession(patientId, data);
        toast.success("Sesión registrada exitosamente");
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error("Error al procesar sesión");
    }
  };

  const attemptDelete = async () => {
    if (!sessionInfo || !window.confirm("¿Seguro que deseas eliminar esta evolución de sesión?")) return;
    try {
      await deleteSession(sessionInfo.id, patientId);
      toast.success("Sesión eliminada");
      onOpenChange(false);
    } catch (error) {
      toast.error("Error el eliminar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Detalle de Sesión" : "Registrar Nueva Sesión / Evolución"}</DialogTitle>
          <DialogDescription>
            Documenta lo trabajado con el paciente en el día de la fecha.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-danger-600">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duración (min) *</Label>
              <Input id="duration" type="number" {...register("duration")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="painLevel">Dolor Actual (EVA 0-10)</Label>
              <Input id="painLevel" type="number" min="0" max="10" {...register("painLevel")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientState">Estado Subjetivo (¿Cómo llegó el paciente hoy?)</Label>
            <Input id="patientState" {...register("patientState")} placeholder="Mejoría del dolor, molestias post-sesión anterior..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatmentType">Tratamiento y Técnicas Aplicadas *</Label>
            <Textarea 
                id="treatmentType" 
                {...register("treatmentType")} 
                placeholder="Magnetoterapia, masajes descontracturantes, ejercicios propioceptivos..." 
                rows={3} 
            />
            {errors.treatmentType && <p className="text-xs text-danger-600">{errors.treatmentType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="progressMetrics">Progreso y Mediciones (ROM, fuerza, etc)</Label>
            <Textarea id="progressMetrics" {...register("progressMetrics")} placeholder="Logra flexión competa, camina 10 min sin dolor..." rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observaciones Generales</Label>
            <Textarea id="notes" {...register("notes")} rows={2} />
          </div>

          <DialogFooter className="flex justify-between items-center sm:justify-between pt-4">
            {isEditing ? (
               <Button type="button" variant="ghost" className="text-danger-600 hover:bg-danger-50 p-2" onClick={attemptDelete}>
                 <Trash2 className="w-4 h-4 mr-2" /> Borrar
               </Button>
            ) : <div/>}
            <div className="flex gap-2">
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                 Cerrar
               </Button>
               <Button type="submit" disabled={isSubmitting}>
                 {isEditing ? "Actualizar" : "Guardar Evolución"}
               </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
