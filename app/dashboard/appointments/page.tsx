"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Plus, User, Search, Pencil, Trash2, ChevronLeft, ChevronRight, LayoutList, CalendarDays } from "lucide-react";
import { AppointmentForm } from "./appointment-form";
import { CalendarView } from "./calendar-view";
import { getAppointments, deleteAppointment, getPatientsForCombobox, getAppointmentsByDateRange } from "./actions";
import { AppointmentStatus } from "@prisma/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

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

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [patients, setPatients] = useState<{ id: string; firstName: string; lastName: string; dni: string }[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithPatient | null>(null);
  const [selectedDateForNew, setSelectedDateForNew] = useState<Date | undefined>(undefined);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<AppointmentWithPatient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Logic depending on View Mode
  const fetchData = async (page: number = pagination.page, searchQuery: string = search, specificDate: Date = currentDate) => {
    setIsLoading(true);
    try {
      if (viewMode === "list") {
        const result = await getAppointments(searchQuery || undefined, page, pagination.limit);
        setAppointments(result.appointments as AppointmentWithPatient[]);
        setPagination(result.pagination);
      } else {
        const monthStart = startOfMonth(specificDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
        
        const result = await getAppointmentsByDateRange(startDate.toISOString(), endDate.toISOString());
        setAppointments(result as AppointmentWithPatient[]);
      }
    } catch (error) {
      toast.error("Error al cargar los turnos");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const list = await getPatientsForCombobox();
      setPatients(list);
    } catch (error) {
      console.error(error);
    }
  };

  // Re-fetch when viewMode or currentDate changes
  useEffect(() => {
    fetchData(1, search, currentDate);
  }, [viewMode, currentDate]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setViewMode("list"); // Force list view on search
    fetchData(1, search);
  };

  const handleEdit = (appointment: AppointmentWithPatient) => {
    setSelectedAppointment(appointment);
    setSelectedDateForNew(undefined);
    setFormOpen(true);
  };

  const handleCreateNew = (date?: Date) => {
    setSelectedAppointment(null);
    setSelectedDateForNew(date);
    setFormOpen(true);
  };

  const handleDelete = (appointment: AppointmentWithPatient) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;
    try {
      await deleteAppointment(appointmentToDelete.id);
      toast.success("Turno eliminado correctamente");
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
      fetchData();
    } catch (error) {
      toast.error("Error al eliminar el turno");
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setTimeout(() => {
      setSelectedAppointment(null);
      setSelectedDateForNew(undefined);
    }, 200);
    fetchData(); // Refresh data after close
  };

  const statusLabels: Record<AppointmentStatus, string> = {
    CONFIRMED: "Confirmado",
    PENDING: "Pendiente",
    CANCELLED: "Cancelado",
    COMPLETED: "Completado",
    NO_SHOW: "No Asistió",
  };

  const statusVariants: Record<AppointmentStatus, "success" | "warning" | "destructive" | "default"> = {
    CONFIRMED: "success",
    PENDING: "warning",
    CANCELLED: "destructive",
    COMPLETED: "default",
    NO_SHOW: "destructive",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Turnos</h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona los turnos de tu centro
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* View Toggler */}
          <div className="flex bg-muted p-1 rounded-lg">
            <button 
              onClick={() => { setSearch(""); setViewMode("calendar"); }} 
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "calendar" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <CalendarDays className="h-4 w-4" />
              Calendario
            </button>
            <button 
              onClick={() => setViewMode("list")} 
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutList className="h-4 w-4" />
              Lista
            </button>
          </div>
          
          <Button onClick={() => handleCreateNew()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Turno
          </Button>
        </div>
      </div>

      {/* Search (Only show in list mode or when there is an active search that diverted us to list) */}
      {viewMode === "list" && (
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente, DNI o motivo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Buscar</Button>
            {search && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  fetchData(1, "", currentDate);
                }}
              >
                Limpiar
              </Button>
            )}
          </form>
        </div>
      )}

      {/* Main Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Cargando turnos...
          </div>
        ) : viewMode === "calendar" ? (
          <CalendarView 
            appointments={appointments}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onEditAppointment={handleEdit}
            onCreateAppointment={handleCreateNew}
          />
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2 border border-dashed rounded-lg">
            <Clock className="h-8 w-8 mb-2" />
            <p>No se encontraron turnos</p>
            <Button variant="link" onClick={() => handleCreateNew()} className="text-primary">
              Crear el primer turno
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow relative group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {appointment.reason || "Sin especificar"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusVariants[appointment.status]}>
                      {statusLabels[appointment.status]}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4 shrink-0" />
                      <span>
                        {new Date(appointment.date).toLocaleDateString("es-AR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          timeZone: "UTC",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>
                        {appointment.startTime} - {appointment.endTime}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(appointment)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-danger-600 hover:text-danger-700 focus:text-danger-700 hover:bg-danger-50" onClick={() => handleDelete(appointment)}>
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination only for List Mode */}
        {viewMode === "list" && !isLoading && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              a{" "}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              de <span className="font-medium">{pagination.total}</span> turnos
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => fetchData(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => fetchData(pagination.page + 1)}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Form Dialog */}
      <AppointmentForm
        open={formOpen}
        onOpenChange={handleFormClose}
        appointment={selectedAppointment}
        selectedDateForNew={selectedDateForNew}
        patients={patients}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Cancelación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este turno de{" "}
              <span className="font-medium text-foreground">
                {appointmentToDelete?.patient.firstName} {appointmentToDelete?.patient.lastName}
              </span>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Volver
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Borrar Definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
