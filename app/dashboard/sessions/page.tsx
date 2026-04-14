"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, User, FileText } from "lucide-react";

export default function SessionsPage() {
  const mockSessions = [
    {
      id: "1",
      patient: "Lucia Fernandez",
      date: "2026-04-14",
      treatment: "Kinesiologia respiratoria",
      duration: "45 min",
      notes: "Paciente presenta mejoria en capacidad respiratoria",
    },
    {
      id: "2",
      patient: "Martin Rodriguez",
      date: "2026-04-14",
      treatment: "Rehabilitacion de rodilla",
      duration: "60 min",
      notes: "Ejercicios de fortalecimiento progresivo",
    },
    {
      id: "3",
      patient: "Ana Garcia",
      date: "2026-04-13",
      treatment: "Masoterapia",
      duration: "30 min",
      notes: "Sesion de descarga muscular",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sesiones</h1>
          <p className="mt-1 text-muted-foreground">
            Registro de sesiones realizadas
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Sesion
        </Button>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {mockSessions.map((session) => (
          <Card key={session.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-foreground">
                        {session.patient}
                      </p>
                      <Badge variant="default">{session.treatment}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.date).toLocaleDateString("es-AR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {session.notes}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-foreground">
                    {session.duration}
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    Ver detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
