import Link from "next/link";
import { endOfDay, endOfWeek, startOfDay, startOfWeek } from "date-fns";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUserOrThrow, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  Users,
  CalendarCheck,
  Clock,
  TrendingUp,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

type UpcomingAppointment = {
  id: string;
  date: Date;
  startTime: string;
  status: AppointmentStatus;
  reason: string | null;
  patient: {
    firstName: string;
    lastName: string;
  };
};

function getStatusLabel(status: AppointmentStatus) {
  switch (status) {
    case "CONFIRMED":
      return "Confirmado";
    case "PENDING":
      return "Pendiente";
    case "COMPLETED":
      return "Completado";
    case "NO_SHOW":
      return "No asistió";
    case "CANCELLED":
      return "Cancelado";
    default:
      return status;
  }
}

function getStatusVariant(
  status: AppointmentStatus
): "success" | "warning" | "default" | "destructive" {
  switch (status) {
    case "CONFIRMED":
      return "success";
    case "PENDING":
      return "warning";
    case "COMPLETED":
      return "default";
    case "NO_SHOW":
    case "CANCELLED":
      return "destructive";
    default:
      return "default";
  }
}

function calculateTrend(currentValue: number, previousValue: number) {
  if (currentValue === previousValue) {
    return {
      value: "0%",
      trend: "neutral" as const,
    };
  }

  if (previousValue === 0) {
    return {
      value: `+${currentValue}`,
      trend: "up" as const,
    };
  }

  const percentage = Math.round(((currentValue - previousValue) / previousValue) * 100);

  return {
    value: `${percentage > 0 ? "+" : ""}${percentage}%`,
    trend: percentage > 0 ? ("up" as const) : ("down" as const),
  };
}

export default async function DashboardPage() {
  const user = await getCurrentUserOrThrow();
  const admin = isAdmin(user);

  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const previousDayStart = startOfDay(new Date(dayStart.getTime() - 24 * 60 * 60 * 1000));
  const previousDayEnd = endOfDay(previousDayStart);
  const previousWeekReference = new Date(weekStart.getTime() - 24 * 60 * 60 * 1000);
  const previousWeekStart = startOfWeek(previousWeekReference, { weekStartsOn: 1 });
  const previousWeekEnd = endOfWeek(previousWeekReference, { weekStartsOn: 1 });

  const appointmentScope: Prisma.AppointmentWhereInput = admin
    ? {}
    : { professionalId: user.id };
  const sessionScope: Prisma.SessionWhereInput = admin
    ? {}
    : { professionalId: user.id };

  const [
    totalPatients,
    appointmentsToday,
    appointmentsYesterday,
    sessionsThisWeek,
    sessionsLastWeek,
    completedAppointments,
    noShowAppointments,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.patient.count({
      where: { isActive: true },
    }),
    prisma.appointment.count({
      where: {
        ...appointmentScope,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          not: "CANCELLED",
        },
      },
    }),
    prisma.appointment.count({
      where: {
        ...appointmentScope,
        date: {
          gte: previousDayStart,
          lte: previousDayEnd,
        },
        status: {
          not: "CANCELLED",
        },
      },
    }),
    prisma.session.count({
      where: {
        ...sessionScope,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    }),
    prisma.session.count({
      where: {
        ...sessionScope,
        date: {
          gte: previousWeekStart,
          lte: previousWeekEnd,
        },
      },
    }),
    prisma.appointment.count({
      where: {
        ...appointmentScope,
        status: "COMPLETED",
      },
    }),
    prisma.appointment.count({
      where: {
        ...appointmentScope,
        status: "NO_SHOW",
      },
    }),
    prisma.appointment.findMany({
      where: {
        ...appointmentScope,
        date: {
          gte: dayStart,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 5,
    }),
  ]);

  const attendanceBase = completedAppointments + noShowAppointments;
  const attendanceRate =
    attendanceBase === 0
      ? 0
      : Math.round((completedAppointments / attendanceBase) * 100);

  const patientTrend = {
    value: `${totalPatients} activos`,
    trend: "up" as const,
  };
  const appointmentsTrend = calculateTrend(appointmentsToday, appointmentsYesterday);
  const sessionsTrend = calculateTrend(sessionsThisWeek, sessionsLastWeek);
  const attendanceTrend =
    attendanceBase === 0
      ? { value: "Sin datos", trend: "neutral" as const }
      : {
          value: `${completedAppointments}/${attendanceBase}`,
          trend: attendanceRate >= 70 ? ("up" as const) : ("down" as const),
        };

  const stats = [
    {
      title: "Total Pacientes",
      value: String(totalPatients),
      change: patientTrend.value,
      trend: patientTrend.trend,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10 dark:bg-primary/20",
    },
    {
      title: "Turnos Hoy",
      value: String(appointmentsToday),
      change: appointmentsTrend.value,
      trend: appointmentsTrend.trend,
      icon: CalendarCheck,
      color: "text-accent",
      bgColor: "bg-accent/10 dark:bg-accent/20",
    },
    {
      title: "Sesiones esta Semana",
      value: String(sessionsThisWeek),
      change: sessionsTrend.value,
      trend: sessionsTrend.trend,
      icon: Clock,
      color: "text-warning-500",
      bgColor: "bg-warning-500/10 dark:bg-warning-500/20",
    },
    {
      title: "Tasa de Asistencia",
      value: `${attendanceRate}%`,
      change: attendanceTrend.value,
      trend: attendanceTrend.trend,
      icon: TrendingUp,
      color: "text-success-500",
      bgColor: "bg-success-500/10 dark:bg-success-500/20",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Bienvenido de nuevo. Aqui tienes un resumen real de tu actividad
          {admin ? " global" : " profesional"}.
        </p>
      </div>

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
                        : stat.trend === "down"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    )}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : stat.trend === "down" ? (
                      <ArrowDownRight className="h-3 w-3" />
                    ) : null}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Próximos Turnos</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                No hay próximos turnos confirmados o pendientes.
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment: UpcomingAppointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium text-foreground">
                          {appointment.patient.firstName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.reason || "Consulta sin motivo especificado"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {new Date(appointment.date).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          timeZone: "UTC",
                        })}{" "}
                        {appointment.startTime}
                      </span>
                      <Badge variant={getStatusVariant(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-auto px-4 py-3"
            >
              <Link href="/dashboard/patients">
                <Users className="h-4 w-4" />
                <span className="flex flex-col items-start">
                  <span>Nuevo Paciente</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Registrar y administrar pacientes
                  </span>
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-auto px-4 py-3"
            >
              <Link href="/dashboard/appointments">
                <Calendar className="h-4 w-4" />
                <span className="flex flex-col items-start">
                  <span>Agendar Turno</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Crear y reordenar turnos del día
                  </span>
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-auto px-4 py-3"
            >
              <Link href="/dashboard/sessions">
                <FileText className="h-4 w-4" />
                <span className="flex flex-col items-start">
                  <span>Registrar Sesión</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Documentar evolución clínica
                  </span>
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-auto px-4 py-3"
            >
              <Link href="/dashboard/analytics">
                <TrendingUp className="h-4 w-4" />
                <span className="flex flex-col items-start">
                  <span>Ver Reportes</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Consultar métricas y tendencias
                  </span>
                </span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
