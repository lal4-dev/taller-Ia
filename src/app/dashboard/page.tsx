'use client';

/**
 * ==============================================================================
 * PÁGINA: PANEL PRINCIPAL DE TAREAS (/dashboard)
 * ==============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { TodoStatsCards } from '@/components/todos/TodoStatsCards';
import { TodoForm } from '@/components/todos/TodoForm';
import { TodoFilterBar } from '@/components/todos/TodoFilterBar';
import { TodoList } from '@/components/todos/TodoList';
import { todoService } from '@/services/todoService';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Tarea, CrearTareaDTO, ActualizarTareaDTO, FiltroTareas, EstadisticasTareas } from '@/types/todo';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  // Estados reactivos principales
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [todos, setTodos] = useState<Tarea[]>([]);
  const [stats, setStats] = useState<EstadisticasTareas>({ total: 0, completadas: 0, pendientes: 0, tasaProgreso: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FiltroTareas>({ estado: 'todas', prioridad: 'todas', busqueda: '' });
  
  // Alertas emergentes (Toasts)
  const [notificacion, setNotificacion] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const mostrarNotificacion = (type: 'success' | 'error' | 'info', message: string) => {
    setNotificacion({ type, message });
    setTimeout(() => {
      setNotificacion(null);
    }, 4000);
  };

  const cargarDatos = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await todoService.getTodos(filter);
      setTodos(items);
      const statsCalculadas = await todoService.getStats(items);
      setStats(statsCalculadas);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar las tareas';
      mostrarNotificacion('error', msg);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const inicializarSesion = async () => {
      if (isSupabaseConfigured()) {
        const usuario = await authService.getCurrentUser();
        if (!usuario) {
          router.replace('/login');
          return;
        }
        setUserEmail(usuario.email || 'Usuario');
      } else {
        setUserEmail('invitado@modo-demo.local');
      }
      cargarDatos();
    };

    inicializarSesion();
  }, [router, cargarDatos]);

  // Manejadores CRUD
  const handleAddTodo = async (dto: CrearTareaDTO) => {
    try {
      const creada = await todoService.createTodo(dto);
      mostrarNotificacion('success', `Tarea "${creada.titulo}" agregada correctamente.`);
      cargarDatos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo crear la tarea';
      mostrarNotificacion('error', msg);
    }
  };

  const handleToggle = async (id: string, completada: boolean) => {
    try {
      await todoService.toggleTodo(id, completada);
      cargarDatos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo actualizar el estado';
      mostrarNotificacion('error', msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await todoService.deleteTodo(id);
      mostrarNotificacion('info', 'Tarea eliminada exitosamente.');
      cargarDatos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo eliminar la tarea';
      mostrarNotificacion('error', msg);
    }
  };

  const handleUpdate = async (id: string, updates: ActualizarTareaDTO) => {
    try {
      await todoService.updateTodo(id, updates);
      mostrarNotificacion('success', 'Tarea actualizada.');
      cargarDatos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo modificar la tarea';
      mostrarNotificacion('error', msg);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar userEmail={userEmail} />

      <main className="app-container">
        {notificacion && (
          <div
            className="animate-fade-in"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 100,
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background:
                notificacion.type === 'success'
                  ? 'rgba(16, 185, 129, 0.95)'
                  : notificacion.type === 'error'
                  ? 'rgba(239, 68, 68, 0.95)'
                  : 'rgba(99, 102, 241, 0.95)',
              color: '#ffffff',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontWeight: 500,
              fontSize: '0.9rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            {notificacion.type === 'success' && <CheckCircle2 size={18} />}
            {notificacion.type === 'error' && <AlertCircle size={18} />}
            {notificacion.type === 'info' && <Info size={18} />}
            <span>{notificacion.message}</span>
          </div>
        )}

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            Panel de Tareas
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Organiza tus actividades, establece prioridades y mantén el control de tus metas diarias.
          </p>
        </div>

        <TodoStatsCards stats={stats} />
        <TodoForm onAddTodo={handleAddTodo} />
        <TodoFilterBar filter={filter} onFilterChange={setFilter} />
        <TodoList
          todos={todos}
          isLoading={isLoading}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </main>
    </div>
  );
}
