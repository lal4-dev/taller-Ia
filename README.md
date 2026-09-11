# 🚀 TaskPulse - Next.js & Supabase Todo Application

Aplicación web de gestión de tareas con arquitectura limpia, desarrollada en **Next.js (App Router)** y **Supabase** (Autenticación y Base de Datos PostgreSQL con Row Level Security).

---

## 🏛️ Arquitectura y Documentación Técnica

El proyecto cuenta con documentación completa en la carpeta [`docs/`](file:///c:/Repos-Hub/taller-Ia/docs):

1. 📐 **[docs/ARCHITECTURE.md](file:///c:/Repos-Hub/taller-Ia/docs/ARCHITECTURE.md)**: Especificación de la arquitectura en capas, principios de diseño y diagrama de secuencia del flujo de datos.
2. 🗄️ **[docs/SUPABASE_SETUP.md](file:///c:/Repos-Hub/taller-Ia/docs/SUPABASE_SETUP.md)**: Script SQL completo para inicializar la tabla `todos`, índices de rendimiento y políticas de seguridad RLS.
3. 📚 **[docs/API_AND_SERVICES.md](file:///c:/Repos-Hub/taller-Ia/docs/API_AND_SERVICES.md)**: Contratos y métodos de las capas `authService` y `todoService`.

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (Tipado estricto de extremo a extremo)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS + GoTrue Auth)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Estilos**: Vanilla CSS Moderno (Glassmorphism, Dark Mode, Google Fonts `Outfit` y `Plus Jakarta Sans`)

---

## ⚡ Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea tu archivo `.env.local` a partir de `.env.local.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-public-key
```

### 3. Ejecutar el script SQL en Supabase
Copia el script de [`docs/SUPABASE_SETUP.md`](file:///c:/Repos-Hub/taller-Ia/docs/SUPABASE_SETUP.md) y ejecútalo en el **SQL Editor** de Supabase.

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.