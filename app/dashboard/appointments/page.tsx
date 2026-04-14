"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, User } from "lucide-react";

export default function AppointmentsPage() {
  const mockAppointments = [
    {
      id: "1",
      patient: "Lucia Fernandez",
      date: "2026-04-15",
      time: "09:00 - 10:00",
      treatment: "Kinesiologia respiratoria",
      status: "confirmed",
    },
    {
      id: "2",
      patient: "Martin Rodriguez",
      date: "2026-04-15",
      time: "10:30 - 11:30",
      treatment: "Rehabilitacion de rodilla",
      status: "pending",
    },
    {
      id: "3",
      patient: "Ana Garcia",
      date: "2026-04-15",
      time: "11:45 - 12:45",
      treatment: "Masoterapia",
      status: "confirmed",
    },
    {
      id: "4",
      patient: "Carlos Lopez",
      date: "2026-04-16",
      time: "14:00 - 15:00",
      treatment: "Electroterapia",
      status: "pending",
    },
  ];

  const statusLabels: Record<string, string> = {
    confirmed: "Confirmado",
    pending: "Pendiente",
    cancelled: "Cancelado",
    completed: "Completado",
    no_show: "No mostrado",
  };

  const statusVariants: Record<string, "success" | "warning" | "destructive" | "default"> = {
    confirmed: "success",
    pending: "warning",
    cancelled: "destructive",
    completed: "default",
    no_show: "destructive",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Turnos</h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona los turnos de tu centro
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Turno
        </Button>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockAppointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {appointment.patient}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.treatment}
                    </p>
                  </div>
                </div>
                <Badge variant={statusVariants[appointment.status]}>
                  {statusLabels[appointment.status]}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(appointment.date).toLocaleDateString("es-AR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{appointment.time}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
                <Button size="sm" className="flex-1">
                  Iniciar Sesion
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
