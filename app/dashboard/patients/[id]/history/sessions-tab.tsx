'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  NotebookPen,
  Clock,
  Calendar,
  Activity,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SessionForm } from './session-form';

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

  const getPainColor = (painLevel: number | null) => {
    if (painLevel === null) return 'bg-gray-500';
    if (painLevel >= 8) return 'bg-red-500';
    if (painLevel >= 6) return 'bg-orange-500';
    if (painLevel >= 4) return 'bg-yellow-500';
    if (painLevel >= 2) return 'bg-emerald-500';
    return 'bg-green-500';
  };

  const getPainBadgeColor = (pain: number) => {
    if (pain >= 8) return 'bg-red-500 text-white';
    if (pain >= 6) return 'bg-orange-500 text-white';
    if (pain >= 4) return 'bg-yellow-500 text-white';
    if (pain >= 2) return 'bg-emerald-500 text-white';
    return 'bg-green-500 text-white';
  };

  // Group sessions by month for better organization
  const sessionsByMonth = sessions.reduce(
    (acc, session) => {
      const date = new Date(session.date);
      const monthYear = date.toLocaleDateString('es-AR', {
        month: 'long',
        year: 'numeric',
      });
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(session);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  return (
    <div className="space-y-8 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <NotebookPen className="h-6 w-6 text-primary" />
            Evolución de Sesiones
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Registro diario de tratamientos y progreso del paciente
          </p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          size="lg"
          className="shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Sesión
        </Button>
      </div>

      {/* Empty State */}
      {sessions.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <NotebookPen className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Sin sesiones registradas
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Comienza a documentar cada sesión de tratamiento para seguir el
              progreso
            </p>
            <Button onClick={() => handleOpenForm()} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Registrar primera sesión
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Sessions grouped by month */}
          {Object.entries(sessionsByMonth).map(([monthYear, monthSessions]) => (
            <div key={monthYear} className="space-y-4">
              {/* Month Header */}
              <div className="flex items-center gap-3 sticky top-20 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 rounded-lg">
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-border to-transparent" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {monthYear}
                </h3>
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-border to-transparent" />
              </div>

              {/* Sessions */}
              <div className="space-y-3">
                {monthSessions.map((session) => (
                  <Card
                    key={session.id}
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden border-l-4 hover:border-l-primary"
                    style={{
                      borderLeftColor:
                        session.painLevel !== null
                          ? getPainColor(session.painLevel)
                              .replace('bg-', 'var(--')
                              .replace('500', '-500)')
                          : 'var(--border)',
                    }}
                    onClick={() => handleOpenForm(session)}
                  >
                    {/* Color accent bar */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${session.painLevel !== null ? getPainColor(session.painLevel) : 'bg-muted'}`}
                    />

                    <CardContent className="p-5 sm:p-6 pl-6 sm:pl-8">
                      {/* Header */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                        <div className="flex-1 space-y-3">
                          {/* Date and Time */}
                          <div className="flex items-center flex-wrap gap-3">
                            <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                              <Calendar className="h-4 w-4 text-primary" />
                              {new Date(session.date).toLocaleDateString(
                                'es-AR',
                                {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'short',
                                },
                              )}
                            </div>

                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1.5" />
                              {session.duration} min
                            </Badge>

                            {session.painLevel !== null && (
                              <Badge
                                className={`${getPainBadgeColor(session.painLevel)} font-semibold`}
                              >
                                <Activity className="w-3 h-3 mr-1.5" />
                                EVA: {session.painLevel}/10
                              </Badge>
                            )}
                          </div>

                          {/* Patient State */}
                          {session.patientState && (
                            <div className="flex items-start gap-2 text-sm">
                              <span className="text-muted-foreground min-w-24">
                                Estado:
                              </span>
                              <p className="text-foreground/90 font-medium line-clamp-2">
                                {session.patientState}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Grid */}
                      <div className="grid gap-4 pt-4 border-t border-border">
                        {/* Treatment */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <FileText className="h-4 w-4" />
                            <span>Tratamiento y Técnicas Aplicadas</span>
                          </div>
                          <p className="text-sm text-foreground/80 pl-6 line-clamp-3">
                            {session.treatmentType}
                          </p>
                        </div>

                        {/* Progress */}
                        {session.progressMetrics && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                              <Activity className="h-4 w-4" />
                              <span>Progreso y Mediciones</span>
                            </div>
                            <p className="text-sm text-foreground/80 pl-6 line-clamp-2">
                              {session.progressMetrics}
                            </p>
                          </div>
                        )}

                        {/* Notes */}
                        {session.notes && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                              <NotebookPen className="h-4 w-4" />
                              <span>Observaciones</span>
                            </div>
                            <p className="text-sm text-muted-foreground/80 pl-6 line-clamp-2 italic">
                              {session.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Hover indicator */}
                      <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs text-primary">→</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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
