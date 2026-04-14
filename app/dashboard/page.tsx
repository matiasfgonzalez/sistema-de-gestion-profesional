"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Users,
  CalendarCheck,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Pacientes",
      value: "147",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10 dark:bg-primary/20",
    },
    {
      title: "Turnos Hoy",
      value: "12",
      change: "+3",
      trend: "up",
      icon: CalendarCheck,
      color: "text-accent",
      bgColor: "bg-accent/10 dark:bg-accent/20",
    },
    {
      title: "Sesiones esta Semana",
      value: "34",
      change: "-5%",
      trend: "down",
      icon: Clock,
      color: "text-warning-500",
      bgColor: "bg-warning-500/10 dark:bg-warning-500/20",
    },
    {
      title: "Tasa de Retencion",
      value: "89%",
      change: "+8%",
      trend: "up",
      icon: TrendingUp,
      color: "text-success-500",
      bgColor: "bg-success-500/10 dark:bg-success-500/20",
    },
  ];

  const upcomingAppointments = [
    {
      patient: "Lucia Fernandez",
      time: "09:00",
      treatment: "Kinesiologia respiratoria",
      status: "confirmed",
    },
    {
      patient: "Martin Rodriguez",
      time: "10:30",
      treatment: "Rehabilitacion de rodilla",
      status: "pending",
    },
    {
      patient: "Ana Garcia",
      time: "11:45",
      treatment: "Masoterapia",
      status: "confirmed",
    },
    {
      patient: "Carlos Lopez",
      time: "14:00",
      treatment: "Electroterapia",
      status: "pending",
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Bienvenido de nuevo. Aqui tienes un resumen de tu actividad.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-xl", stat.bgColor)}>
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      stat.trend === "up"
                        ? "text-success-500"
                        : "text-destructive"
                    )}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Proximos Turnos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium text-foreground">
                        {appointment.patient.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {appointment.patient}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.treatment}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {appointment.time}
                    </span>
                    <Badge
                      variant={
                        appointment.status === "confirmed"
                          ? "success"
                          : "warning"
                      }
                    >
                      {appointment.status === "confirmed"
                        ? "Confirmado"
                        : "Pendiente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rapidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-xl border border-border hover:bg-accent transition-colors">
              <p className="text-sm font-medium text-foreground">
                Nuevo Paciente
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Registrar un nuevo paciente
              </p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl border border-border hover:bg-accent transition-colors">
              <p className="text-sm font-medium text-foreground">
                Agendar Turno
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Crear un nuevo turno
              </p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl border border-border hover:bg-accent transition-colors">
              <p className="text-sm font-medium text-foreground">
                Registrar Sesion
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Documentar una sesion
              </p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl border border-border hover:bg-accent transition-colors">
              <p className="text-sm font-medium text-foreground">
                Ver Reportes
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Analisis y estadisticas
              </p>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
