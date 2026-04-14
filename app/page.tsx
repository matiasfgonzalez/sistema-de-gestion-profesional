'use client';

import {
  Activity,
  Calendar,
  ChartBar,
  ChevronRight,
  Clock,
  Shield,
  Users,
  Star,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              FisioGestiona
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="#benefits"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Beneficios
            </a>
            <a
              href="#testimonials"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonios
            </a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth/sign-in">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm">
                Comenzar gratis
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-accent/5 dark:from-primary/10 dark:via-background dark:to-accent/10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-150 w-150 rounded-full bg-primary/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary dark:bg-primary/20">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                Nuevo: Analisis avanzado de pacientes
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Gestiona tus pacientes{' '}
                <span className="text-primary">facilmente</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0">
                El sistema completo para centros de kinesiologia. Administra
                turnos, sesiones y pacientes en una sola plataforma moderna e
                intuitiva.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="w-full sm:w-auto">
                    Comenzar gratis
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Ver funcionalidades
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-background bg-muted"
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">+500</span>{' '}
                  profesionales confian en nosotros
                </div>
              </div>
            </div>

            {/* Dashboard Preview - Fixed for Dark Mode */}
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-xl dark:shadow-2xl">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-4">
                  {/* Mock dashboard content - Dark mode compatible */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-primary/10 p-4 dark:bg-primary/20">
                      <p className="text-xs text-primary">Pacientes</p>
                      <p className="text-2xl font-bold text-primary">147</p>
                    </div>
                    <div className="rounded-xl bg-accent/10 p-4 dark:bg-accent/20">
                      <p className="text-xs text-accent">Turnos hoy</p>
                      <p className="text-2xl font-bold text-accent">12</p>
                    </div>
                    <div className="rounded-xl bg-success-500/10 p-4 dark:bg-success-500/20">
                      <p className="text-xs text-success-500">Sesiones</p>
                      <p className="text-2xl font-bold text-success-500">89</p>
                    </div>
                  </div>
                  {/* Chart placeholder */}
                  <div className="h-32 rounded-xl bg-muted/50 dark:bg-muted/30" />
                  {/* List items */}
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl bg-muted/30 p-3 dark:bg-muted/20"
                      >
                        <div className="h-8 w-8 rounded-full bg-muted" />
                        <div className="flex-1">
                          <div className="h-3 w-24 rounded bg-muted" />
                          <div className="mt-1 h-2 w-16 rounded bg-muted/60" />
                        </div>
                        <div className="h-6 w-16 rounded-full bg-primary/20 dark:bg-primary/30" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Todo lo que necesitas para{' '}
              <span className="text-primary">gestionar tu centro</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Herramientas poderosas disenadas especificamente para
              profesionales de la kinesiologia
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: 'Gestion de Pacientes',
                description:
                  'Registra y administra todos los datos de tus pacientes, incluyendo historial medico y observaciones.',
              },
              {
                icon: Calendar,
                title: 'Calendario de Turnos',
                description:
                  'Organiza turnos de forma visual, evita superposiciones y envia recordatorios automaticos.',
              },
              {
                icon: Clock,
                title: 'Registro de Sesiones',
                description:
                  'Documenta cada sesion con notas detalladas, tipo de tratamiento y recomendaciones.',
              },
              {
                icon: ChartBar,
                title: 'Analisis y Reportes',
                description:
                  'Visualiza metricas clave con graficos interactivos y toma decisiones basadas en datos.',
              },
              {
                icon: Shield,
                title: 'Seguridad Avanzada',
                description:
                  'Datos protegidos con autenticacion robusta y control de acceso por roles.',
              },
              {
                icon: Activity,
                title: 'Historial Clinico',
                description:
                  'Accede rapidamente al historial completo de cada paciente en un solo lugar.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/30"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground dark:bg-primary/20">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-20 sm:py-28 bg-muted/50 dark:bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Disenado para{' '}
                <span className="text-primary">profesionales como tu</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Entendemos las necesidades de un centro de kinesiologia. Por eso
                creamos una herramienta que simplifica tu trabajo diario.
              </p>

              <div className="mt-8 space-y-6">
                {[
                  {
                    stat: '40%',
                    label: 'Menos tiempo en administracion',
                  },
                  {
                    stat: '3x',
                    label: 'Mas pacientes atendidos',
                  },
                  {
                    stat: '99.9%',
                    label: 'Disponibilidad garantizada',
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <span className="text-lg font-bold">{benefit.stat}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {benefit.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Interfaz intuitiva',
                  description: 'Sin curva de aprendizaje',
                },
                {
                  title: 'Acceso movil',
                  description: 'Desde cualquier dispositivo',
                },
                { title: 'Soporte 24/7', description: 'Siempre disponible' },
                { title: 'Actualizaciones', description: 'Mejoras constantes' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <h3 className="font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Lo que dicen nuestros{' '}
              <span className="text-primary">usuarios</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                name: 'Dra. Valentina Moretti',
                role: 'Centro KineSalud, Buenos Aires',
                content:
                  'Desde que uso FisioGestiona, pude organizar mejor mis turnos y mis pacientes estan mas satisfechos con el seguimiento.',
              },
              {
                name: 'Lic. Martin Castellano',
                role: 'Clinica del Movimiento, Cordoba',
                content:
                  'La interfaz es increiblemente intuitiva. Mis colegas y yo pudimos adaptarnos sin necesidad de capacitacion.',
              },
              {
                name: 'Dra. Camila Reyes',
                role: 'RehabFit, Mendoza',
                content:
                  'Los reportes y graficos me ayudan a entender mejor la evolucion de mis pacientes. Una herramienta indispensable.',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 fill-warning-500 text-warning-500"
                    />
                  ))}
                </div>
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-medium text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-linear-to-br from-primary to-primary/80 px-6 py-16 text-center sm:px-12 sm:py-20">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Comienza hoy mismo
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Prueba gratuita de 14 dias. Sin tarjeta de credito.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="w-full bg-white text-primary hover:bg-white/90 sm:w-auto"
                >
                  Crear cuenta gratuita
                  <ArrowRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-white/30 text-white hover:bg-white/10 sm:w-auto"
                >
                  Iniciar sesion
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                FisioGestiona
              </span>
            </div>

            <div className="flex gap-8">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacidad
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terminos
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contacto
              </a>
            </div>

            <p className="text-sm text-muted-foreground">
              2026 FisioGestiona. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
