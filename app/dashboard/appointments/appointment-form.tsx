"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentFormSchema, type AppointmentFormValues, type AppointmentFormInput } from "@/lib/validations/appointment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAppointment, updateAppointment } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentStatus } from "@prisma/client";

// Tipado extendido para los datos que nos llegan de Prisma, 
// ya que Prisma devuelve un objeto más rico si incluimos el paciente.
type AppointmentData = {
  id: string;
  patientId: string;
  professionalId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  reason: string | null;
};

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: AppointmentData | null;
  selectedDateForNew?: Date;
  patients: { id: string; firstName: string; lastName: string; dni: string }[];
}

export function AppointmentForm({ open, onOpenChange, appointment, selectedDateForNew, patients }: AppointmentFormProps) {
  const router = useRouter();
  const isEditing = !!appointment;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<AppointmentFormInput, unknown, AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: "",
      date: "",
      startTime: "",
      endTime: "",
      status: AppointmentStatus.PENDING,
      reason: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (appointment) {
        reset({
          patientId: appointment.patientId,
          date: new Date(appointment.date).toISOString().split("T")[0],
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
          reason: appointment.reason || "",
          notes: appointment.notes || "",
        });
      } else {
        reset({
          patientId: "",
          date: selectedDateForNew ? selectedDateForNew.toISOString().split("T")[0] : "",
          startTime: "",
          endTime: "",
          status: AppointmentStatus.PENDING,
          reason: "",
          notes: "",
        });
      }
    }
  }, [open, appointment, selectedDateForNew, reset]);

  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      if (isEditing && appointment) {
        await updateAppointment(appointment.id, data);
        toast.success("Turno actualizado correctamente");
      } else {
        await createAppointment(data);
        toast.success("Turno creado correctamente");
      }
      onOpenChange(false);
      reset();
      router.refresh();
    } catch (error) {
      toast.error(isEditing ? "Error al actualizar el turno" : "Error al crear el turno");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Turno" : "Nuevo Turno"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza los detalles del turno seleccionado"
              : "Asigna un turno a un paciente"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientId">Paciente *</Label>
            <Select
              value={watch("patientId")}
              onValueChange={(value) => setValue("patientId", value)}
              disabled={isEditing} // Generalmente no se cambia el paciente de un turno ya creado
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.lastName}, {p.firstName} - DNI: {p.dni}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.patientId && (
              <p className="text-xs text-danger-600">{errors.patientId.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
              />
              {errors.date && (
                <p className="text-xs text-danger-600">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">H. Inicio *</Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime")}
              />
              {errors.startTime && (
                <p className="text-xs text-danger-600">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">H. Fin *</Label>
              <Input
                id="endTime"
                type="time"
                {...register("endTime")}
              />
              {errors.endTime && (
                <p className="text-xs text-danger-600">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as AppointmentStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado del turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                  <SelectItem value="COMPLETED">Completado</SelectItem>
                  <SelectItem value="NO_SHOW">No Asistió</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo / Tratamiento</Label>
              <Input
                id="reason"
                {...register("reason")}
                placeholder="Ej. Kinesiología"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas para el turno</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Detalles adicionales, recordatorios..."
              rows={3}
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
              {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
