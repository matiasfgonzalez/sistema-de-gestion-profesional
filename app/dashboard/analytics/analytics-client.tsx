"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, CalendarCheck, Clock, TrendingUp } from "lucide-react";

type TrendDirection = "up" | "down" | "neutral";

type StatCard = {
  title: string;
  value: string;
  change: string;
  icon: "users" | "appointments" | "sessions" | "retention";
  color: string;
  bgColor: string;
  trend: TrendDirection;
};

type MonthlyPatientsDatum = {
  month: string;
  patients: number;
};

type AppointmentStatusDatum = {
  status: string;
  value: number;
  color: string;
};

type SessionsByMonthDatum = {
  month: string;
  sessions: number;
};

type AnalyticsClientProps = {
  stats: StatCard[];
  monthlyPatientsData: MonthlyPatientsDatum[];
  appointmentsByStatusData: AppointmentStatusDatum[];
  sessionsByMonthData: SessionsByMonthDatum[];
  subtitle: string;
};

const iconMap = {
  users: Users,
  appointments: CalendarCheck,
  sessions: Clock,
  retention: TrendingUp,
};

export function AnalyticsClient({
  stats,
  monthlyPatientsData,
  appointmentsByStatusData,
  sessionsByMonthData,
  subtitle,
}: AnalyticsClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Analisis</h1>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon];
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      stat.trend === "up"
                        ? "text-success-500"
                        : stat.trend === "down"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {stat.change}
                  </span>
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pacientes por Mes */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes por Mes</CardTitle>
            <CardDescription>
              Evolucion de pacientes registrados en los ultimos 12 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full min-w-0">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyPatientsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="patients"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Turnos por Estado */}
        <Card>
          <CardHeader>
            <CardTitle>Turnos por Estado</CardTitle>
            <CardDescription>
              Distribucion de turnos del periodo actual segun su estado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full min-w-0">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentsByStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      nameKey="status"
                      labelLine={false}
                    >
                      {appointmentsByStatusData.map((entry) => (
                        <Cell key={entry.status} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {appointmentsByStatusData.map((entry) => (
                <div
                  key={entry.status}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-muted-foreground">{entry.status}</span>
                  </div>
                  <span className="font-medium text-foreground">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sesiones Realizadas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sesiones Realizadas</CardTitle>
            <CardDescription>
              Cantidad de sesiones realizadas en los ultimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full min-w-0">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionsByMonthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
