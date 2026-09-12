-- ==============================================================================
-- MIGRACIÓN: ESQUEMA DE BASE DE DATOS EN ESPAÑOL ('tareas')
-- ==============================================================================

-- 1. Limpieza de tablas previas
drop table if exists public.todos cascade;
drop table if exists public.tareas cascade;

-- 2. Creación de la tabla 'tareas' con columnas 100% en español
create table public.tareas (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  titulo text not null check (char_length(titulo) > 0),
  descripcion text default '',
  prioridad text default 'media' check (prioridad in ('baja', 'media', 'alta')),
  completada boolean default false not null,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null,
  actualizado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Índices de rendimiento
create index tareas_usuario_id_idx on public.tareas (usuario_id);
create index tareas_completada_idx on public.tareas (completada);
create index tareas_creado_en_idx on public.tareas (creado_en desc);

-- 4. Habilitar Row Level Security (RLS)
alter table public.tareas enable row level security;

-- 5. Políticas de Seguridad RLS en español
create policy "Los usuarios pueden ver sus propias tareas"
  on public.tareas for select
  using (auth.uid() = usuario_id);

create policy "Los usuarios pueden crear sus propias tareas"
  on public.tareas for insert
  with check (auth.uid() = usuario_id);

create policy "Los usuarios pueden actualizar sus propias tareas"
  on public.tareas for update
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

create policy "Los usuarios pueden eliminar sus propias tareas"
  on public.tareas for delete
  using (auth.uid() = usuario_id);

-- 6. Función y Trigger automático para actualizar 'actualizado_en'
create or replace function public.actualizar_fecha_modificacion()
returns trigger as $$
begin
  new.actualizado_en = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger disparador_actualizar_fecha_tareas
  before update on public.tareas
  for each row
  execute function public.actualizar_fecha_modificacion();
