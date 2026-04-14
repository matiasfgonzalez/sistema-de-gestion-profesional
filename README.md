# FisioGestiona - Sistema de Gestión para Centros de Kinesiología

Una aplicación web profesional y moderna para gestionar centros de kinesiología, diseñada con las mejores prácticas de desarrollo y un enfoque en la experiencia del usuario.

## 🚀 Características

- **Gestión de Pacientes**: CRUD completo con búsqueda, paginación y validación
- **Calendario de Turnos**: Organización visual de turnos con estados (pendiente, confirmado, cancelado, completado)
- **Registro de Sesiones**: Documentación detallada de cada sesión con notas y tratamientos
- **Dashboard Analítico**: Gráficos interactivos con métricas clave del negocio
- **Autenticación Segura**: Sistema de autenticación con Clerk y control de roles (ADMIN/PROFESSIONAL)
- **Modo Claro/Oscuro**: Toggle persistente con detección automática de preferencia del sistema
- **Diseño Responsive**: Mobile-first, funciona perfectamente en cualquier dispositivo
- **Notificaciones**: Sistema de toast notifications para feedback al usuario

## 🛠️ Stack Tecnológico

### Core
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **PostgreSQL**

### UI & UX
- **ShadCN UI** (componentes base)
- **Lucide React** (iconos)
- **Framer Motion** (animaciones)
- **Recharts** (gráficos)

### Backend & Data
- **Prisma ORM**
- **Zod** (validación)
- **React Hook Form** (formularios)

### Auth
- **Clerk** (autenticación y gestión de usuarios)

### Utilities
- **date-fns** (manejo de fechas)
- **Sonner** (notificaciones toast)
- **Zustand** (estado global)

## 📋 Requisitos Previos

- Node.js 20+ 
- PostgreSQL 15+
- Cuenta de Clerk (para autenticación)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd sistema-de-gestion-profesional
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
copy .env.example .env
```

Edita `.env` y configura tus credenciales:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/fisiogestiona?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_TU_CLAVE"
CLERK_SECRET_KEY="sk_test_TU_SECRETO"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

### 4. Configurar Clerk

1. Ve a [clerk.com](https://clerk.com) y crea una cuenta
2. Crea una nueva aplicación
3. Copia las claves API desde el dashboard de Clerk
4. Configura las URLs de redirección en Clerk:
   - Sign In: `/auth/sign-in`
   - Sign Up: `/auth/sign-up`
   - After Sign In/Up: `/dashboard`

### 5. Configurar la base de datos

Crea la base de datos en PostgreSQL:

```bash
createdb fisiogestiona
```

Ejecuta las migraciones de Prisma:

```bash
npx prisma migrate dev --name init
```

Esto generará la tabla de base de datos y el cliente de Prisma.

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
sistema-de-gestion-profesional/
├── app/                          # Next.js App Router
│   ├── auth/                     # Rutas de autenticación
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── dashboard/                # Dashboard privado
│   │   ├── analytics/           # Página de análisis
│   │   ├── appointments/        # Gestión de turnos
│   │   ├── patients/            # Gestión de pacientes
│   │   ├── sessions/            # Registro de sesiones
│   │   └── settings/            # Configuración
│   ├── layout.tsx               # Layout global
│   └── page.tsx                 # Landing page
├── components/                   # Componentes reutilizables
│   ├── dashboard/               # Componentes del dashboard
│   ├── providers/               # Providers (theme, etc.)
│   └── ui/                      # Componentes UI base
├── lib/                         # Utilidades y configuraciones
│   ├── auth.ts                  # Funciones de autenticación
│   ├── prisma.ts               # Cliente Prisma
│   ├── utils.ts                # Utilidades generales
│   └── validations/            # Esquemas Zod
├── prisma/                      # Schema y migraciones
│   └── schema.prisma           # Modelo de base de datos
├── middleware.ts               # Middleware de Clerk
├── app/globals.css            # Estilos globales
└── package.json               # Dependencias
```

## 🎨 Diseño y Temas

### Paleta de Colores

La aplicación utiliza una paleta médica profesional basada en tonos teal/verde:

- **Primario**: Teal (`#14b8a6`) - Color principal de la marca
- **Acento**: Azul (`#3b82f6`) - Para elementos secundarios
- **Éxito**: Verde (`#22c55e`) - Estados positivos
- **Advertencia**: Ámbar (`#f59e0b`) - Estados pendientes
- **Peligro**: Rojo (`#ef4444`) - Errores y cancelaciones

### Modo Claro/Oscuro

- Detección automática de la preferencia del sistema
- Toggle persistente en localStorage
- Transiciones suaves entre modos

## 🔐 Seguridad

### Autenticación
- Protección de rutas con Clerk Middleware
- Autenticación basada en sesiones
- Sincronización automática de usuarios con la base de datos

### Control de Acceso
- **ADMIN**: Acceso completo a todas las funcionalidades
- **PROFESSIONAL**: Acceso limitado a sus propios pacientes y turnos

### Validación
- Validación en servidor con Zod
- Validación en cliente con React Hook Form
- Prevención de SQL injection con Prisma ORM

## 📊 Modelo de Base de Datos

### User
- Información del profesional/admin
- Sincronizado con Clerk
- Roles: ADMIN, PROFESSIONAL

### Patient
- Datos personales (nombre, apellido, DNI, teléfono, email)
- Historial médico
- Observaciones
- Soft delete

### Appointment
- Relación con paciente y profesional
- Fecha, hora de inicio y fin
- Estado (PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)

### Session
- Relación con paciente, profesional y turno opcional
- Tipo de tratamiento
- Duración
- Notas y recomendaciones

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Docker

```bash
docker build -t fisiogestiona .
docker run -p 3000:3000 fisiogestiona
```

## 📈 Roadmap

- [ ] Integración con calendario externo (Google Calendar)
- [ ] Recordatorios automáticos por email/SMS
- [ ] Reportes PDF exportables
- [ ] Chat interno entre profesionales
- [ ] App móvil (React Native)
- [ ] Integración con facturación
- [ ] Telemedicina (video llamadas)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@fisiogestiona.com
- Documentación: [docs.fisiogestiona.com](#)

## 🙏 Agradecimientos

- Next.js Team
- Vercel
- Clerk
- Prisma
- Tailwind CSS
- Todos los contribuidores

---

Hecho con ❤️ para profesionales de la kinesiología
