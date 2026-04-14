"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, User, Activity, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EvaluationForm } from "./evaluation-form";

interface EvaluationsTabProps {
  patientId: string;
  evaluations: any[]; // Prisma Evaluation Type
}

export function EvaluationsTab({ patientId, evaluations }: EvaluationsTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState<any | null>(null);

  const handleOpenForm = (evaluation?: any) => {
    setSelectedEval(evaluation || null);
    setFormOpen(true);
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "INIT": return "default";
      case "FOLLOW_UP": return "secondary";
      case "DISCHARGE": return "success";
      default: return "outline";
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "INIT": return "Evaluación Inicial";
      case "FOLLOW_UP": return "Re-evaluación";
      case "DISCHARGE": return "Alta";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Evaluaciones Médicas</h2>
          <p className="text-muted-foreground text-sm">Historial de tests, rangos y dolor</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Evaluación
        </Button>
      </div>

      {evaluations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Activity className="w-10 h-10 mb-2 opacity-50" />
            <p>Aún no hay evaluaciones registradas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative border-l border-muted ml-4 space-y-6">
          {evaluations.map((ev) => (
            <div key={ev.id} className="relative pl-6">
              {/* Timeline dot */}
              <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-6 ring-4 ring-background" />
              
              <Card 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleOpenForm(ev)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">
                        {new Date(ev.evalDate).toLocaleDateString("es-AR", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </span>
                      <Badge variant={getBadgeColor(ev.type) as any}>{getTypeName(ev.type)}</Badge>
                    </div>
                    {ev.painScale !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">EVA:</span>
                        <Badge variant={ev.painScale > 6 ? "destructive" : ev.painScale > 3 ? "warning" : "success"} className="text-sm">
                          {ev.painScale}/10
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {ev.subjective && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium">Subjetivo (Siente):</p>
                        <p className="line-clamp-2">{ev.subjective}</p>
                      </div>
                    )}
                    {ev.objectiveROM && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium">Rangos de Movimiento (ROM):</p>
                        <p className="line-clamp-2">{ev.objectiveROM}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" size="sm" className="h-8 text-primary">
                      Ver detalle <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <EvaluationForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        patientId={patientId}
        evaluation={selectedEval}
      />
    </div>
  );
}
