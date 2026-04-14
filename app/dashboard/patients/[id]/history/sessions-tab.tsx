"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, NotebookPen, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SessionForm } from "./session-form";

interface SessionsTabProps {
  patientId: string;
  sessions: any[]; // Prisma Session Type
}

export function SessionsTab({ patientId, sessions }: SessionsTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  const handleOpenForm = (session?: any) => {
    setSelectedSession(session || null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Evolución de Sesiones</h2>
          <p className="text-muted-foreground text-sm">Registro diario de tratamientos y progreso</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="w-4 h-4 mr-2" />
          Registrar Sesión
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <NotebookPen className="w-10 h-10 mb-2 opacity-50" />
            <p>No hay sesiones registradas en el historial</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card 
              key={session.id} 
              className="hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
              onClick={() => handleOpenForm(session)}
            >
              {/* Color ribbon indicating pain severity roughly */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                session.painLevel !== null && session.painLevel > 7 ? 'bg-danger-500' :
                session.painLevel !== null && session.painLevel > 3 ? 'bg-warning-500' :
                session.painLevel !== null ? 'bg-success-500' : 'bg-primary/50'
              }`} />
              
              <CardContent className="p-4 sm:p-5 pl-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="font-semibold text-foreground">
                          {new Date(session.date).toLocaleDateString("es-AR", {
                            weekday: "short", day: "numeric", month: "short"
                          })}
                       </span>
                       <Badge variant="outline" className="text-xs font-normal">
                          <Clock className="w-3 h-3 mr-1" />
                          {session.duration} min
                       </Badge>
                       {session.painLevel !== null && (
                         <Badge variant={session.painLevel > 6 ? "destructive" : session.painLevel > 3 ? "warning" : "success"} className="text-xs">
                            EVA: {session.painLevel}
                         </Badge>
                       )}
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4 text-sm pt-2">
                       <div>
                         <span className="text-muted-foreground block mb-0.5">Tratamiento / Técnicas:</span>
                         <p className="font-medium text-foreground line-clamp-2">{session.treatmentType}</p>
                       </div>
                       
                       {session.progressMetrics && (
                       <div>
                         <span className="text-muted-foreground block mb-0.5">Progreso / Médicion:</span>
                         <p className="font-medium text-foreground line-clamp-2">{session.progressMetrics}</p>
                       </div>
                       )}
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center md:items-start opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SessionForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        patientId={patientId}
        sessionInfo={selectedSession}
      />
    </div>
  );
}
