"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PatientForm } from "./patient-form";
import { deletePatient, getPatients } from "./actions";
import { formatDateShort } from "@/lib/utils";
import { Patient } from "@prisma/client";
import { Search, Plus, Pencil, Trash2, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = async (page: number = pagination.page, searchQuery: string = search) => {
    setIsLoading(true);
    try {
      const result = await getPatients(searchQuery || undefined, page, pagination.limit);
      setPatients(result.patients);
      setPagination(result.pagination);
    } catch (error) {
      toast.error("Error al cargar los pacientes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(1, search);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;

    try {
      await deletePatient(patientToDelete.id);
      toast.success("Paciente eliminado correctamente");
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
      fetchPatients();
    } catch (error) {
      toast.error("Error al eliminar el paciente");
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedPatient(null);
    fetchPatients();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="mt-1 text-foreground-muted">
            Gestiona los pacientes de tu centro
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Buscar por nombre, apellido, DNI o email..."
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
                fetchPatients(1, "");
              }}
            >
              Limpiar
            </Button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-background-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Fecha de Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Cargando pacientes...
                  </div>
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Users className="h-8 w-8" />
                    <p>No se encontraron pacientes</p>
                    <Button variant="link" onClick={() => setFormOpen(true)} className="text-primary">
                      Crear el primer paciente
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {patient.firstName} {patient.lastName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground-muted">
                    {patient.dni}
                  </TableCell>
                  <TableCell className="text-foreground-muted">
                    {patient.phone}
                  </TableCell>
                  <TableCell className="text-foreground-muted">
                    {patient.email || "-"}
                  </TableCell>
                  <TableCell className="text-foreground-muted">
                    {formatDateShort(patient.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(patient)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(patient)}
                        className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-950/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-foreground-muted">
            Mostrando{" "}
            <span className="font-medium">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            a{" "}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            de <span className="font-medium">{pagination.total}</span> pacientes
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => fetchPatients(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => fetchPatients(pagination.page + 1)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Patient Form Dialog */}
      <PatientForm
        open={formOpen}
        onOpenChange={handleFormClose}
        patient={selectedPatient}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a{" "}
              <span className="font-medium text-foreground">
                {patientToDelete?.firstName} {patientToDelete?.lastName}
              </span>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
