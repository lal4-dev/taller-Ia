'use client';

/**
 * ==============================================================================
 * PÁGINA: PANEL PRINCIPAL DE TAREAS (/dashboard)
 * ==============================================================================
 * Orquesta toda la experiencia del usuario autenticado:
 * 1. Inicializa la sesión y protege la ruta contra accesos anónimos.
 * 2. Carga y sincroniza las tareas desde Supabase.
 * 3. Muestra métricas visuales en tiempo real.
 * 4. Permite crear, filtrar, editar, completar y eliminar tareas con notificaciones flotantes (Toasts).
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
import { Todo, CreateTodoDTO, UpdateTodoDTO, TodoFilter, TodoStats } from '@/types/todo';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  // Estados reactivos principales
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats>({ total: 0, completed: 0, pending: 0, completionRate: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<TodoFilter>({ status: 'all', priority: 'all', searchQuery: '' });
  
  // Estado para alertas y notificaciones emergentes (Toasts)
  const [notificacion, setNotificacion] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  /**
   * Muestra un mensaje flotante temporal que desaparece automáticamente tras 4 segundos.
   */
  const mostrarNotificacion = (type: 'success' | 'error' | 'info', message: string) => {
    setNotificacion({ type, message });
    setTimeout(() => {
      setNotificacion(null);
    }, 4000);
  };

  /**
   * Carga las tareas desde la capa de servicios aplicando los filtros actuales
   * y recalcula las estadísticas de productividad.
   */
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

  /**
   * Efecto de inicialización: comprueba sesión y carga datos iniciales
   */
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

  // =========================================================================
  // MANEJADORES DE ACCIONES CRUD
  // =========================================================================

  /** Crear nueva tarea */
  const handleAddTodo = async (dto: CreateTodoDTO) => {
    try {
      const creada = await todoService.createTodo(dto);
      mostrarNotificacion('success', `Tarea "${creada.title}" agregada correctamente.`);
      cargarDatos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo crear la tarea';
      mostrarNotificacion('error', msg);
    }
  };

  /** Alternar estado completada / pendiente */
  const handleToggle = async (id: string, is_completed: boolean) => {
    try {
      await todoService.toggleTodo(id, is_completed);
      cargarDatos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo actualizar el estado';
      mostrarNotificacion('error', msg);
    }
  };

  /** Eliminar tarea */
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

  /** Actualizar contenido de una tarea */
  const handleUpdate = async (id: string, updates: UpdateTodoDTO) => {
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
      {/* Barra de navegación superior */}
      <Navbar userEmail={userEmail} />

      <main className="app-container">
        {/* Notificación flotante emergente (Toast) */}
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

        {/* Encabezado del Dashboard */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            Panel de Tareas
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Organiza tus actividades, establece prioridades y mantén el control de tus metas diarias.
          </p>
        </div>

        {/* Tarjetas de Métricas Estadísticas */}
        <TodoStatsCards stats={stats} />

        {/* Formulario para Añadir Tareas */}
        <TodoForm onAddTodo={handleAddTodo} />

        {/* Barra de Búsqueda y Filtros */}
        <TodoFilterBar filter={filter} onFilterChange={setFilter} />

        {/* Lista de Tareas */}
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
