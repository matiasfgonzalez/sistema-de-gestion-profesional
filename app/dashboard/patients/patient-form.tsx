"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientFormSchema, type PatientFormValues } from "@/lib/validations/patient";
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
import { createPatient, updatePatient } from "./actions";
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
import { Patient } from "@prisma/client";

interface PatientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
}

export function PatientForm({ open, onOpenChange, patient }: PatientFormProps) {
  const router = useRouter();
  const isEditing = !!patient;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patient
      ? {
          firstName: patient.firstName,
          lastName: patient.lastName,
          dni: patient.dni,
          phone: patient.phone,
          email: patient.email || "",
          dateOfBirth: patient.dateOfBirth
            ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: patient.gender || "",
          address: patient.address || "",
          medicalHistory: patient.medicalHistory || "",
          observations: patient.observations || "",
        }
      : {
          firstName: "",
          lastName: "",
          dni: "",
          phone: "",
          email: "",
          dateOfBirth: "",
          gender: "",
          address: "",
          medicalHistory: "",
          observations: "",
        },
  });

  useEffect(() => {
    if (open) {
      if (patient) {
        reset({
          firstName: patient.firstName,
          lastName: patient.lastName,
          dni: patient.dni,
          phone: patient.phone,
          email: patient.email || "",
          dateOfBirth: patient.dateOfBirth
            ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: patient.gender || "",
          address: patient.address || "",
          medicalHistory: patient.medicalHistory || "",
          observations: patient.observations || "",
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          dni: "",
          phone: "",
          email: "",
          dateOfBirth: "",
          gender: "",
          address: "",
          medicalHistory: "",
          observations: "",
        });
      }
    }
  }, [open, patient, reset]);

  const onSubmit = async (data: PatientFormValues) => {
    try {
      if (isEditing && patient) {
        await updatePatient(patient.id, data);
        toast.success("Paciente actualizado correctamente");
      } else {
        await createPatient(data);
        toast.success("Paciente creado correctamente");
      }
      onOpenChange(false);
      reset();
      router.refresh();
    } catch (error) {
      toast.error(isEditing ? "Error al actualizar el paciente" : "Error al crear el paciente");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Paciente" : "Nuevo Paciente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza los datos del paciente"
              : "Completa los datos para registrar un nuevo paciente"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Nombre del paciente"
              />
              {errors.firstName && (
                <p className="text-xs text-danger-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Apellido del paciente"
              />
              {errors.lastName && (
                <p className="text-xs text-danger-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                {...register("dni")}
                placeholder="Documento de identidad"
              />
              {errors.dni && (
                <p className="text-xs text-danger-600">{errors.dni.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Teléfono de contacto"
              />
              {errors.phone && (
                <p className="text-xs text-danger-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="text-xs text-danger-600">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Género</Label>
              <Select
                value={watch("gender")}
                onValueChange={(value) => setValue("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefiero no decir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Dirección del paciente"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Historial Médico</Label>
            <Textarea
              id="medicalHistory"
              {...register("medicalHistory")}
              placeholder="Antecedentes médicos, alergias, condiciones..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones</Label>
            <Textarea
              id="observations"
              {...register("observations")}
              placeholder="Notas adicionales sobre el paciente..."
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
