# TODO - Sistema de Gestion Profesional

## Entendimiento del proyecto

### Objetivo principal del sistema
Construir una plataforma para centros/profesionales de kinesiologia y fisioterapia que permita gestionar la operacion diaria (pacientes y agenda) y el circuito clinico (historia clinica, evaluaciones y sesiones) en un unico lugar, con autenticacion y base para control por roles.

### Regla de negocio central
Cada paciente avanza por un flujo asistencial trazable: registro administrativo -> agenda de turnos -> evaluacion clinica -> sesiones de evolucion -> alta, todo vinculado a profesionales autenticados.

---

## Prioridades de trabajo

## P0 - Critico (seguridad, integridad y riesgo operativo)

- [x] Fortalecer autorizacion en acciones clinicas sensibles:
  - validar propiedad/acceso por profesional en borrado de evaluaciones y sesiones.
  - evitar que un profesional pueda afectar registros clinicos fuera de su alcance.
- [x] Implementar validaciones de agenda obligatorias:
  - impedir turnos superpuestos por profesional.
  - validar `startTime < endTime` y duraciones minimas/maximas.
- [x] Reemplazar la "edicion por delete+create" de evaluaciones/sesiones:
  - crear `updateEvaluation` y `updateSession` reales.
  - preservar trazabilidad, IDs e historial temporal.
- [x] Estandarizar reglas RBAC en todo el dashboard:
  - alinear comportamiento real con lo prometido en README.
  - consolidar proteccion por rol en middleware + server actions.

## P1 - Alto impacto (producto y experiencia clinica)

- [x] Convertir dashboard principal en datos reales:
  - metricas de pacientes activos, turnos del dia, no-show y carga de agenda.
- [x] Reemplazar `analytics` mockeado por consultas a BD:
  - ocupacion, cancelaciones, asistencia y tendencia por periodo.
- [x] Definir flujo clinico formal por episodio:
  - evaluacion inicial -> plan terapeutico -> sesiones -> reevaluacion -> alta.
  - estados e hitos obligatorios para asegurar consistencia.
  - auto-cierre de episodio al registrar evaluacion de alta (DISCHARGE).
  - validaciones de orden en server actions (sin eval inicial no hay sesiones).
- [ ] Mejorar manejo de errores de dominio:
  - mensajes accionables (duplicado, conflicto horario, permisos, etc).
  - feedback claro en formularios y acciones.

## P2 - Consolidacion tecnica

- [ ] Reducir uso de `any` en modulos clinicos y analytics:
  - tipar DTOs, respuestas y formularios.
- [ ] Agregar capa de auditoria medico-legal:
  - registrar cambios con `who/when/what` para entidades clinicas.
- [ ] Incorporar pruebas de reglas de negocio:
  - validaciones de agenda,
  - permisos por rol,
  - invariantes del flujo clinico.
- [ ] Crear documentacion funcional y tecnica viva (`docs/`):
  - mapa de dominio,
  - reglas de negocio,
  - decisiones arquitectonicas.

---

## Nuevas funcionalidades recomendadas

### Agenda inteligente
- [ ] Buffers entre turnos por tipo de atencion.
- [ ] Bloqueo por ausencias, feriados y horarios laborales.
- [ ] Plantillas de disponibilidad por profesional.

### Operacion y comunicacion con pacientes
- [ ] Recordatorios automaticos (WhatsApp/SMS/email).
- [ ] Confirmacion de turno y gestion de no-show.
- [ ] Reprogramacion asistida con sugerencias de huecos.

### Capa de gestion del negocio
- [ ] KPIs clinicos y operativos en tiempo real.
- [ ] Reportes exportables (CSV/PDF) por periodo y profesional.
- [ ] Trazabilidad de evolucion EVA por diagnostico/paciente.

### Escalabilidad del producto
- [ ] Soporte multi-sede con reglas por sede.
- [ ] Cartera de pacientes por profesional/equipo.
- [ ] RBAC extendido (admin, coordinacion, recepcion, profesional).

### Modulos de expansion
- [ ] Facturacion y prestaciones (obra social, copagos, paquetes).
- [ ] Gestion documental (consentimientos, estudios adjuntos).
- [ ] Portal del paciente para seguimiento basico.

---

## Ideas de innovacion (MVP+1 / MVP+2)

- [ ] Motor de recomendaciones para planificacion de agenda segun demanda historica.
- [ ] Alertas clinicas tempranas por estancamiento (ej: EVA sin mejora en N sesiones).
- [ ] Asistente de evolucion clinica con plantillas inteligentes por patologia.
- [ ] Indicador de riesgo de abandono de tratamiento.
- [ ] Benchmark interno por sede/profesional (respetando privacidad).

---

## Backlog sugerido por fases

### Fase 1 (2-4 semanas)
- [x] Seguridad/autorizacion en acciones clinicas.
- [x] Validaciones fuertes de agenda.
- [x] Edicion real de evaluaciones/sesiones (sin recreacion).

### Fase 2 (3-6 semanas)
- [x] Dashboard y analytics con datos reales.
- [x] Flujo clinico formal por episodio.
- [ ] Errores de dominio y mejoras UX en formularios.

### Fase 3 (4-8 semanas)
- [ ] Auditoria completa + pruebas de negocio.
- [ ] Recordatorios y no-show.
- [ ] Base multi-sede y RBAC ampliado.

### Fase 4 (evolutivo)
- [ ] Facturacion/prestaciones.
- [ ] Portal paciente.
- [ ] IA asistiva clinica y operativa.

