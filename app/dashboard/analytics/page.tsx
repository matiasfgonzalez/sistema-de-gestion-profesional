"use client";

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

const monthlyPatientsData = [
  { month: "Ene", patients: 45 },
  { month: "Feb", patients: 52 },
  { month: "Mar", patients: 48 },
  { month: "Abr", patients: 61 },
  { month: "May", patients: 55 },
  { month: "Jun", patients: 67 },
  { month: "Jul", patients: 72 },
  { month: "Ago", patients: 68 },
  { month: "Sep", patients: 74 },
  { month: "Oct", patients: 81 },
  { month: "Nov", patients: 78 },
  { month: "Dic", patients: 85 },
];

const appointmentsByStatusData = [
  { status: "Completados", value: 145, color: "hsl(174 65% 35%)" },
  { status: "Pendientes", value: 32, color: "hsl(38 92% 50%)" },
  { status: "Cancelados", value: 12, color: "hsl(0 84% 60%)" },
  { status: "No mostrados", value: 8, color: "hsl(215 16% 47%)" },
];

const sessionsByMonthData = [
  { month: "Ene", sessions: 89 },
  { month: "Feb", sessions: 95 },
  { month: "Mar", sessions: 102 },
  { month: "Abr", sessions: 98 },
  { month: "May", sessions: 110 },
  { month: "Jun", sessions: 125 },
];

const stats = [
  {
    title: "Total Pacientes",
    value: "147",
    change: "+12%",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10 dark:bg-primary/20",
  },
  {
    title: "Turnos este Mes",
    value: "48",
    change: "+8%",
    icon: CalendarCheck,
    color: "text-accent",
    bgColor: "bg-accent/10 dark:bg-accent/20",
  },
  {
    title: "Sesiones este Mes",
    value: "34",
    change: "+15%",
    icon: Clock,
    color: "text-warning-500",
    bgColor: "bg-warning-500/10 dark:bg-warning-500/20",
  },
  {
    title: "Tasa de Retencion",
    value: "89%",
    change: "+5%",
    icon: TrendingUp,
    color: "text-success-500",
    bgColor: "bg-success-500/10 dark:bg-success-500/20",
  },
];

export default function AnalyticsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Analisis</h1>
        <p className="mt-1 text-muted-foreground">
          Metricas y estadisticas de tu centro
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className="text-xs font-medium text-success-500">
                    {stat.change}
                  </span>
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

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Patients by Month - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes por Mes</CardTitle>
            <CardDescription>
              Evolucion de pacientes registrados durante el ano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyPatientsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
            </div>
          </CardContent>
        </Card>

        {/* Appointments by Status - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Turnos por Estado</CardTitle>
            <CardDescription>
              Distribucion de turnos segun su estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentsByStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) =>
                      `${entry.status}: ${(entry.percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {appointmentsByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
            </div>
          </CardContent>
        </Card>

        {/* Sessions by Month - Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sesiones Realizadas</CardTitle>
            <CardDescription>
              Cantidad de sesiones realizadas por mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionsByMonthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar
                    dataKey="sessions"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
