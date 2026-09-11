# 🗄️ Guía de Configuración de Base de Datos - Supabase

Este documento contiene el script SQL y los pasos necesarios para inicializar la base de datos de la aplicación en tu proyecto de Supabase.

---

## 🚀 Pasos de Configuración en el Dashboard de Supabase

1. Accede a [Supabase Dashboard](https://supabase.com/dashboard).
2. Selecciona tu proyecto creado.
3. En el menú lateral izquierdo, haz clic en **SQL Editor** (icono con `>_`).
4. Haz clic en **"New query"** (Nueva consulta).
5. Pega el script SQL que se encuentra a continuación y haz clic en el botón verde **"Run"** (o presiona `Ctrl + Enter`).

---

## 📜 Script SQL Completo

```sql
-- ==============================================================================
-- 1. CREACIÓN DE LA TABLA 'todos'
-- ==============================================================================
create table if not exists public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text not null check (char_length(title) > 0),
  description text default '',
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  is_completed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 2. ÍNDICES DE RENDIMIENTO
-- ==============================================================================
create index if not exists todos_user_id_idx on public.todos (user_id);
create index if not exists todos_is_completed_idx on public.todos (is_completed);
create index if not exists todos_created_at_idx on public.todos (created_at desc);

-- ==============================================================================
-- 3. HABILITACIÓN DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.todos enable row level security;

-- ==============================================================================
-- 4. POLÍTICAS DE SEGURIDAD (RLS POLICIES)
-- ==============================================================================

-- Política SELECT: Los usuarios solo pueden ver sus propias tareas
drop policy if exists "Users can read their own todos" on public.todos;
create policy "Users can read their own todos"
  on public.todos
  for select
  using (auth.uid() = user_id);

-- Política INSERT: Los usuarios solo pueden crear tareas asignadas a su propio ID
drop policy if exists "Users can create their own todos" on public.todos;
create policy "Users can create their own todos"
  on public.todos
  for insert
  with check (auth.uid() = user_id);

-- Política UPDATE: Los usuarios solo pueden modificar sus propias tareas
drop policy if exists "Users can update their own todos" on public.todos;
create policy "Users can update their own todos"
  on public.todos
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Política DELETE: Los usuarios solo pueden borrar sus propias tareas
drop policy if exists "Users can delete their own todos" on public.todos;
create policy "Users can delete their own todos"
  on public.todos
  for delete
  using (auth.uid() = user_id);

-- ==============================================================================
-- 5. TRIGGER AUTOMÁTICO PARA ACTUALIZAR 'updated_at'
-- ==============================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_todos_updated_at on public.todos;
create trigger set_todos_updated_at
  before update on public.todos
  for each row
  execute function public.handle_updated_at();
```

---

## 🔑 Variables de Entorno en el Proyecto

Copia tus credenciales desde **Project Settings > API**:
- **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
- **anon public API Key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

Guárdalas en el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```
