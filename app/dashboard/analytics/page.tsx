import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { getCurrentUserOrThrow, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsClient } from "./analytics-client";

export const dynamic = "force-dynamic";

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const STATUS_COLORS: Record<AppointmentStatus, string> = {
  COMPLETED: "hsl(174 65% 35%)",
  PENDING: "hsl(38 92% 50%)",
  CANCELLED: "hsl(0 84% 60%)",
  NO_SHOW: "hsl(215 16% 47%)",
  CONFIRMED: "hsl(221 83% 53%)",
};

function buildMonthRanges(count: number, baseDate: Date) {
  return Array.from({ length: count }, (_, index) => {
    const date = subMonths(baseDate, count - 1 - index);
    return {
      label: MONTH_LABELS[date.getMonth()],
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  });
}

function calculateTrend(currentValue: number, previousValue: number) {
  if (currentValue === previousValue) {
    return { value: "0%", trend: "neutral" as const };
  }

  if (previousValue === 0) {
    return { value: `+${currentValue}`, trend: "up" as const };
  }

  const percentage = Math.round(((currentValue - previousValue) / previousValue) * 100);
  return {
    value: `${percentage > 0 ? "+" : ""}${percentage}%`,
    trend: percentage > 0 ? ("up" as const) : ("down" as const),
  };
}

export default async function AnalyticsPage() {
  const user = await getCurrentUserOrThrow();
  const admin = isAdmin(user);
  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);
  const previousMonthDate = subMonths(today, 1);
  const previousMonthStart = startOfMonth(previousMonthDate);
  const previousMonthEnd = endOfMonth(previousMonthDate);

  const appointmentScope: Prisma.AppointmentWhereInput = admin
    ? {}
    : { professionalId: user.id };
  const sessionScope: Prisma.SessionWhereInput = admin
    ? {}
    : { professionalId: user.id };

  const [
    totalPatients,
    appointmentsThisMonth,
    appointmentsPreviousMonth,
    sessionsThisMonth,
    sessionsPreviousMonth,
    completedAppointments,
    noShowAppointments,
    cancelledAppointments,
  ] = await Promise.all([
    prisma.patient.count({
      where: { isActive: true },
    }),
    prisma.appointment.count({
      where: {
        ...appointmentScope,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    }),
    prisma.appointment.count({
      where: {
        ...appointmentScope,
        date: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
    }),
    prisma.session.count({
      where: {
        ...sessionScope,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    }),
    prisma.session.count({
      where: {
        ...sessionScope,
        date: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
    }),
    prisma.appointment.count({
      where: {
        ...appointmentScope,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
        status: "COMPLETED",
      },
    }),
    prisma.appointment.count({
      where: {
        ...appointmentScope,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
        status: "NO_SHOW",
      },
    }),
    prisma.appointment.count({
      where: {
        ...appointmentScope,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
        status: "CANCELLED",
      },
    }),
  ]);

  const patientMonthRanges = buildMonthRanges(12, today);
  const sessionMonthRanges = buildMonthRanges(6, today);

  const [monthlyPatientsData, sessionsByMonthData] = await Promise.all([
    Promise.all(
      patientMonthRanges.map(async (range) => ({
        month: range.label,
        patients: await prisma.patient.count({
          where: {
            createdAt: {
              gte: range.start,
              lte: range.end,
            },
          },
        }),
      }))
    ),
    Promise.all(
      sessionMonthRanges.map(async (range) => ({
        month: range.label,
        sessions: await prisma.session.count({
          where: {
            ...sessionScope,
            date: {
              gte: range.start,
              lte: range.end,
            },
          },
        }),
      }))
    ),
  ]);

  const appointmentsByStatusCounts = await Promise.all(
    (Object.keys(STATUS_COLORS) as AppointmentStatus[]).map(async (status) => ({
      status,
      value: await prisma.appointment.count({
        where: {
          ...appointmentScope,
          date: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
          status,
        },
      }),
    }))
  );

  const appointmentsByStatusData = appointmentsByStatusCounts
    .filter((entry) => entry.value > 0)
    .map((entry) => ({
      status:
        entry.status === "COMPLETED"
          ? "Completados"
          : entry.status === "PENDING"
            ? "Pendientes"
            : entry.status === "CANCELLED"
              ? "Cancelados"
              : entry.status === "NO_SHOW"
                ? "No asistió"
                : "Confirmados",
      value: entry.value,
      color: STATUS_COLORS[entry.status],
    }));

  const attendanceBase = completedAppointments + noShowAppointments;
  const attendanceRate =
    attendanceBase === 0 ? 0 : Math.round((completedAppointments / attendanceBase) * 100);
  const cancellationRate =
    appointmentsThisMonth === 0 ? 0 : Math.round((cancelledAppointments / appointmentsThisMonth) * 100);

  const appointmentTrend = calculateTrend(appointmentsThisMonth, appointmentsPreviousMonth);
  const sessionTrend = calculateTrend(sessionsThisMonth, sessionsPreviousMonth);

  const stats = [
    {
      title: "Total Pacientes",
      value: String(totalPatients),
      change: `${monthlyPatientsData[monthlyPatientsData.length - 1]?.patients ?? 0} nuevos`,
      icon: "users" as const,
      color: "text-primary",
      bgColor: "bg-primary/10 dark:bg-primary/20",
      trend: "up" as const,
    },
    {
      title: "Turnos este Mes",
      value: String(appointmentsThisMonth),
      change: appointmentTrend.value,
      icon: "appointments" as const,
      color: "text-accent",
      bgColor: "bg-accent/10 dark:bg-accent/20",
      trend: appointmentTrend.trend,
    },
    {
      title: "Sesiones este Mes",
      value: String(sessionsThisMonth),
      change: sessionTrend.value,
      icon: "sessions" as const,
      color: "text-warning-500",
      bgColor: "bg-warning-500/10 dark:bg-warning-500/20",
      trend: sessionTrend.trend,
    },
    {
      title: "Tasa de Asistencia",
      value: `${attendanceRate}%`,
      change: `Cancelaciones ${cancellationRate}%`,
      icon: "retention" as const,
      color: "text-success-500",
      bgColor: "bg-success-500/10 dark:bg-success-500/20",
      trend: attendanceRate >= 70 ? ("up" as const) : ("down" as const),
    },
  ];

  return (
    <AnalyticsClient
      stats={stats}
      monthlyPatientsData={monthlyPatientsData}
      appointmentsByStatusData={appointmentsByStatusData}
      sessionsByMonthData={sessionsByMonthData}
      subtitle={
        admin
          ? "Metricas y estadisticas globales del centro"
          : "Metricas y estadisticas de tu actividad profesional"
      }
    />
  );
}
