# 🗄️ Guía de Configuración de Base de Datos - Supabase (Esquema en Español)

Este documento contiene el script SQL de la tabla `tareas` y los pasos para inicializar la base de datos en Supabase con nombres y políticas 100% en español.

---

## 🚀 Pasos de Configuración en el Dashboard de Supabase

1. Accede a [Supabase Dashboard](https://supabase.com/dashboard).
2. Selecciona tu proyecto.
3. En el menú lateral izquierdo, haz clic en **SQL Editor** (`>_`).
4. Haz clic en **"New query"**, pega el siguiente script y pulsa **"Run"**.

---

## 📜 Script SQL Completo (`tareas`)

```sql
-- ==============================================================================
-- 1. CREACIÓN DE LA TABLA 'tareas' (100% EN ESPAÑOL)
-- ==============================================================================
create table if not exists public.tareas (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  titulo text not null check (char_length(titulo) > 0),
  descripcion text default '',
  prioridad text default 'media' check (prioridad in ('baja', 'media', 'alta')),
  completada boolean default false not null,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null,
  actualizado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 2. ÍNDICES DE RENDIMIENTO
-- ==============================================================================
create index if not exists tareas_usuario_id_idx on public.tareas (usuario_id);
create index if not exists tareas_completada_idx on public.tareas (completada);
create index if not exists tareas_creado_en_idx on public.tareas (creado_en desc);

-- ==============================================================================
-- 3. HABILITACIÓN DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.tareas enable row level security;

-- ==============================================================================
-- 4. POLÍTICAS DE SEGURIDAD EN ESPAÑOL (RLS POLICIES)
-- ==============================================================================

-- Lectura: Cada usuario solo puede ver sus propias tareas
drop policy if exists "Los usuarios pueden ver sus propias tareas" on public.tareas;
create policy "Los usuarios pueden ver sus propias tareas"
  on public.tareas for select
  using (auth.uid() = usuario_id);

-- Creación: Cada usuario solo puede insertar asignando su propio usuario_id
drop policy if exists "Los usuarios pueden crear sus propias tareas" on public.tareas;
create policy "Los usuarios pueden crear sus propias tareas"
  on public.tareas for insert
  with check (auth.uid() = usuario_id);

-- Actualización: Cada usuario solo puede modificar sus propias tareas
drop policy if exists "Los usuarios pueden actualizar sus propias tareas" on public.tareas;
create policy "Los usuarios pueden actualizar sus propias tareas"
  on public.tareas for update
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

-- Eliminación: Cada usuario solo puede borrar sus propias tareas
drop policy if exists "Los usuarios pueden eliminar sus propias tareas" on public.tareas;
create policy "Los usuarios pueden eliminar sus propias tareas"
  on public.tareas for delete
  using (auth.uid() = usuario_id);

-- ==============================================================================
-- 5. TRIGGER AUTOMÁTICO PARA ACTUALIZAR 'actualizado_en'
-- ==============================================================================
create or replace function public.actualizar_fecha_modificacion()
returns trigger as $$
begin
  new.actualizado_en = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists disparador_actualizar_fecha_tareas on public.tareas;
create trigger disparador_actualizar_fecha_tareas
  before update on public.tareas
  for each row
  execute function public.actualizar_fecha_modificacion();
```

---

## 🔑 Variables de Entorno en el Proyecto

Configura tus credenciales en el archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_ACCESS_TOKEN=tu-personal-access-token
```
