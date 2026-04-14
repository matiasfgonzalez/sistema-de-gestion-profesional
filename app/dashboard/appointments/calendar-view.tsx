"use client";

import { AppointmentStatus } from "@prisma/client";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppointmentWithPatient = {
  id: string;
  patientId: string;
  professionalId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  reason: string | null;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    dni: string;
  };
};

interface CalendarViewProps {
  appointments: AppointmentWithPatient[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEditAppointment: (appointment: AppointmentWithPatient) => void;
  onCreateAppointment: (date?: Date) => void;
}

const statusColors: Record<AppointmentStatus, string> = {
  CONFIRMED: "bg-success-100 text-success-800 border-success-200 dark:bg-success-900/30 dark:text-success-300 dark:border-success-800",
  PENDING: "bg-warning-100 text-warning-800 border-warning-200 dark:bg-warning-900/30 dark:text-warning-300 dark:border-warning-800",
  CANCELLED: "bg-danger-100 text-danger-800 border-danger-200 dark:bg-danger-900/30 dark:text-danger-300 dark:border-danger-800",
  COMPLETED: "bg-primary-100 text-primary-800 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800",
  NO_SHOW: "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
};

export function CalendarView({
  appointments,
  currentDate,
  onDateChange,
  onEditAppointment,
  onCreateAppointment,
}: CalendarViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lun
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => onDateChange(addMonths(currentDate, 1));
  const prevMonth = () => onDateChange(subMonths(currentDate, 1));

  // Utility para parsear y alinear la fecha UTC que viene de DB a Local, 
  // previniendo el desfasaje de días cuando alguien crea un turno a la medianoche.
  const getLocalDateFromUTCString = (dateObj: Date) => {
    // Cuando las fechas vienen generadas de Prisma, se asumen UTC. 
    // Usamos el constructor manual con la cadena YYYY-MM-DD para respetar el día.
    const isoString = new Date(dateObj).toISOString(); // "2026-04-15T00:00:00.000Z"
    return new Date(isoString.slice(0, 10) + "T12:00:00"); // forzamos mediodía
  };

  return (
    <div className="bg-background-card rounded-2xl border border-border overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-bold capitalize text-foreground">
          {format(currentDate, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((day) => {
          const dayAppointments = appointments.filter((app) => 
            isSameDay(getLocalDateFromUTCString(app.date), day)
          );

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[140px] p-2 border-r border-b border-border relative group transition-colors hover:bg-muted/10 cursor-pointer ${
                !isSameMonth(day, monthStart) ? "bg-muted/5 opacity-50" : ""
              }`}
              onClick={(e) => {
                if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === "DIV") {
                   onCreateAppointment(day);
                }
              }}
            >
              <div className="flex justify-between items-start mb-1 pointer-events-none">
                <span
                  className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full pointer-events-auto ${
                    isToday(day)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>
                
                <button 
                  className="opacity-0 group-hover:opacity-100 pointer-events-auto text-muted-foreground hover:text-primary transition-opacity"
                  onClick={(e) => {
                     e.stopPropagation();
                     onCreateAppointment(day);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Day's appointments */}
              <div className="flex flex-col gap-1 mt-2 overflow-y-auto max-h-[100px] no-scrollbar">
                {dayAppointments.map((app) => (
                  <div
                    key={app.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAppointment(app);
                    }}
                    className={`cursor-pointer text-xs px-1.5 py-1 rounded border shadow-sm ${statusColors[app.status]} hover:opacity-80 transition-opacity`}
                    title={`${app.startTime} - ${app.patient.firstName} ${app.patient.lastName}`}
                  >
                    <div className="font-semibold text-[10px] leading-tight mb-0.5">{app.startTime}</div>
                    <div className="truncate font-medium">{app.patient.firstName.charAt(0)}. {app.patient.lastName}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
