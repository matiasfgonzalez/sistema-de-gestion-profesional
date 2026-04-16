'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Activity,
  ArrowRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EvaluationForm } from './evaluation-form';
import type { EvaluationRecord } from './types';

interface EvaluationsTabProps {
  patientId: string;
  episodeId?: string | null;
  episodeTitle?: string | null;
  evaluations: EvaluationRecord[];
}

export function EvaluationsTab({
  patientId,
  episodeId,
  episodeTitle,
  evaluations,
}: EvaluationsTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState<EvaluationRecord | null>(null);

  const handleOpenForm = (evaluation?: EvaluationRecord) => {
    setSelectedEval(evaluation || null);
    setFormOpen(true);
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'INIT':
        return 'default';
      case 'FOLLOW_UP':
        return 'secondary';
      case 'DISCHARGE':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'INIT':
        return 'Evaluación Inicial';
      case 'FOLLOW_UP':
        return 'Re-evaluación';
      case 'DISCHARGE':
        return 'Alta';
      default:
        return type;
    }
  };

  const getPainBadgeColor = (pain: number) => {
    if (pain >= 8) return 'bg-red-500 text-white';
    if (pain >= 6) return 'bg-orange-500 text-white';
    if (pain >= 4) return 'bg-yellow-500 text-white';
    if (pain >= 2) return 'bg-emerald-500 text-white';
    return 'bg-green-500 text-white';
  };

  const getPainTrend = (currentIndex: number) => {
    if (currentIndex === evaluations.length - 1) return null;
    const current = evaluations[currentIndex].painScale;
    const previous = evaluations[currentIndex + 1].painScale;
    if (current === null || previous === null) return null;
    if (current < previous) return 'down';
    if (current > previous) return 'up';
    return 'same';
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Evaluaciones Médicas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Historial de tests, rangos de movimiento y dolor
          </p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          size="lg"
          className="shadow-md"
          disabled={!episodeId}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Evaluación
        </Button>
      </div>

      {episodeTitle && (
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Episodio activo: <span className="font-medium text-foreground">{episodeTitle}</span>
        </div>
      )}

      {/* Empty State */}
      {evaluations.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {episodeId
                ? 'Sin evaluaciones registradas para este episodio'
                : 'Selecciona un episodio clínico'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {episodeId
                ? 'Comienza a documentar el progreso del episodio con evaluaciones médicas periódicas'
                : 'Debes seleccionar o crear un episodio antes de registrar evaluaciones'}
            </p>
            <Button onClick={() => handleOpenForm()} variant="outline" disabled={!episodeId}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primera evaluación
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary via-primary/50 to-transparent" />

            <div className="space-y-6">
              {evaluations.map((ev, idx) => {
                const painTrend = getPainTrend(idx);

                return (
                  <div key={ev.id} className="relative pl-14 sm:pl-20">
                    {/* Timeline dot */}
                    <div className="absolute left-4 sm:left-5 top-6 h-6 w-6 rounded-full bg-primary ring-4 ring-background shadow-lg flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>

                    <Card
                      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-primary/50 hover:border-l-primary overflow-hidden"
                      onClick={() => handleOpenForm(ev)}
                    >
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-4 border-b border-border">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                                <Calendar className="h-5 w-5 text-primary" />
                                {new Date(ev.evalDate).toLocaleDateString(
                                  'es-AR',
                                  {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  },
                                )}
                              </div>
                              <Badge
                                variant={getBadgeVariant(ev.type) as 'default' | 'secondary' | 'outline'}
                                className="text-xs"
                              >
                                {getTypeName(ev.type)}
                              </Badge>
                            </div>
                          </div>

                          {ev.painScale !== null && (
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Escala EVA
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={`${getPainBadgeColor(ev.painScale)} text-base font-bold px-3 py-1`}
                                  >
                                    {ev.painScale}/10
                                  </Badge>
                                  {painTrend === 'down' && (
                                    <div className="flex items-center text-green-600 dark:text-green-400">
                                      <TrendingDown className="h-4 w-4" />
                                    </div>
                                  )}
                                  {painTrend === 'up' && (
                                    <div className="flex items-center text-red-600 dark:text-red-400">
                                      <TrendingUp className="h-4 w-4" />
                                    </div>
                                  )}
                                  {painTrend === 'same' && (
                                    <div className="flex items-center text-muted-foreground">
                                      <Minus className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Content Grid */}
                        <div className="grid sm:grid-cols-2 gap-6">
                          {ev.subjective && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-primary flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Evaluación Subjetiva
                              </p>
                              <p className="text-sm text-foreground/80 line-clamp-3 pl-3.5">
                                {ev.subjective}
                              </p>
                            </div>
                          )}

                          {ev.objectiveROM && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-accent flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                Rangos de Movimiento (ROM)
                              </p>
                              <p className="text-sm text-foreground/80 line-clamp-3 pl-3.5">
                                {ev.objectiveROM}
                              </p>
                            </div>
                          )}

                          {ev.objectivePosture && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                                Postura y Estática
                              </p>
                              <p className="text-sm text-foreground/80 line-clamp-2 pl-3.5">
                                {ev.objectivePosture}
                              </p>
                            </div>
                          )}

                          {ev.objectiveStrength && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-600 dark:bg-orange-400" />
                                Fuerza Muscular
                              </p>
                              <p className="text-sm text-foreground/80 line-clamp-2 pl-3.5">
                                {ev.objectiveStrength}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="mt-6 pt-4 border-t border-border flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80 group-hover:translate-x-1 transition-transform"
                          >
                            Ver detalle completo
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <EvaluationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        patientId={patientId}
        episodeId={episodeId ?? ''}
        evaluation={selectedEval}
      />
    </div>
  );
}
