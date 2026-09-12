'use client';

/**
 * ==============================================================================
 * PÁGINA: PANEL PRINCIPAL DE TAREAS (/dashboard)
 * ==============================================================================
 * Implementa Actualizaciones Optimistas (Optimistic UI):
 * - Respuesta instantánea a clics (0 ms de latencia percibida).
 * - Sincronización transparente en segundo plano con Supabase.
 * - Deshacer (Undo) en eliminación de tareas.
 * - Sin parpadeos de carga (Skeleton Flash) al interactuar.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { CheckCircle2, AlertCircle, RotateCcw, X } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  // Estados reactivos
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [todos, setTodos] = useState<Tarea[]>([]);
  const [stats, setStats] = useState<EstadisticasTareas>({ total: 0, completadas: 0, pendientes: 0, tasaProgreso: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FiltroTareas>({ estado: 'todas', prioridad: 'todas', busqueda: '' });
  
  // Notificación flotante con soporte para Deshacer
  const [notificacion, setNotificacion] = useState<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    onUndo?: () => void;
  } | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const recalcularEstadisticas = (lista: Tarea[]) => {
    const total = lista.length;
    const completadas = lista.filter((t) => t.completada).length;
    const pendientes = total - completadas;
    const tasaProgreso = total > 0 ? Math.round((completadas / total) * 100) : 0;
    setStats({ total, completadas, pendientes, tasaProgreso });
  };

  const mostrarNotificacion = (
    type: 'success' | 'error' | 'info',
    message: string,
    onUndo?: () => void
  ) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const id = Date.now().toString();
    setNotificacion({ id, type, message, onUndo });

    timeoutRef.current = setTimeout(() => {
      setNotificacion((prev) => (prev?.id === id ? null : prev));
    }, 4500);
  };

  /**
   * Carga de datos desde Supabase (solo muestra skeleton en carga inicial)
   */
  const cargarDatos = useCallback(async (mostrarEsqueleto = false) => {
    try {
      if (mostrarEsqueleto) setIsLoading(true);
      const items = await todoService.getTodos(filter);
      setTodos(items);
      recalcularEstadisticas(items);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al sincronizar las tareas';
      mostrarNotificacion('error', msg);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const inicializar = async () => {
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
      cargarDatos(true);
    };

    inicializar();
  }, [router, cargarDatos]);

  // =========================================================================
  // OPERACIONES OPTIMISTAS (OPTIMISTIC UI - 0 RETARDO PERCIBIDO)
  // =========================================================================

  /** Crear tarea con inserción optimista */
  const handleAddTodo = async (dto: CrearTareaDTO) => {
    const idTemporal = 'temp-' + Date.now();
    const tareaOptimista: Tarea = {
      id: idTemporal,
      usuario_id: 'temp-user',
      titulo: dto.titulo,
      descripcion: dto.descripcion || null,
      prioridad: dto.prioridad || 'media',
      completada: false,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    };

    // Actualización inmediata en UI
    const nuevaLista = [tareaOptimista, ...todos];
    setTodos(nuevaLista);
    recalcularEstadisticas(nuevaLista);

    try {
      const creada = await todoService.createTodo(dto);
      // Reemplazamos la temporal con la confirmada de Supabase
      setTodos((prev) => prev.map((t) => (t.id === idTemporal ? creada : t)));
    } catch (err: unknown) {
      // Rollback en caso de error
      setTodos((prev) => prev.filter((t) => t.id !== idTemporal));
      recalcularEstadisticas(todos);
      const msg = err instanceof Error ? err.message : 'No se pudo guardar la tarea';
      mostrarNotificacion('error', msg);
    }
  };

  /** Alternar estado completada con actualización optimista */
  const handleToggle = async (id: string, nuevoEstado: boolean) => {
    // 1. Inmediato en pantalla
    const listaAnterior = [...todos];
    const nuevaLista = todos.map((t) =>
      t.id === id ? { ...t, completada: nuevoEstado, actualizado_en: new Date().toISOString() } : t
    );
    setTodos(nuevaLista);
    recalcularEstadisticas(nuevaLista);

    // 2. Sincronización en segundo plano con Supabase
    try {
      await todoService.toggleTodo(id, nuevoEstado);
    } catch (err: unknown) {
      // Revertir estado si la red falla
      setTodos(listaAnterior);
      recalcularEstadisticas(listaAnterior);
      mostrarNotificacion('error', 'Error al sincronizar el estado.');
    }
  };

  /** Eliminar tarea de forma optimista con función de Deshacer (Undo) */
  const handleDelete = async (id: string) => {
    const tareaEliminada = todos.find((t) => t.id === id);
    if (!tareaEliminada) return;

    const listaAnterior = [...todos];
    const nuevaLista = todos.filter((t) => t.id !== id);
    
    // Eliminación visual inmediata
    setTodos(nuevaLista);
    recalcularEstadisticas(nuevaLista);

    let cancelado = false;

    // Toast interactivo con botón "Deshacer"
    mostrarNotificacion('info', `Tarea "${tareaEliminada.titulo}" eliminada.`, () => {
      cancelado = true;
      setTodos(listaAnterior);
      recalcularEstadisticas(listaAnterior);
      setNotificacion(null);
    });

    // Esperar 4.5s antes de ejecutar el borrado permanente en Supabase si no se canceló
    setTimeout(async () => {
      if (!cancelado) {
        try {
          await todoService.deleteTodo(id);
        } catch {
          setTodos(listaAnterior);
          recalcularEstadisticas(listaAnterior);
        }
      }
    }, 4500);
  };

  /** Actualizar tarea de forma optimista */
  const handleUpdate = async (id: string, updates: ActualizarTareaDTO) => {
    const listaAnterior = [...todos];
    const nuevaLista = todos.map((t) =>
      t.id === id ? { ...t, ...updates, actualizado_en: new Date().toISOString() } : t
    );
    setTodos(nuevaLista);
    recalcularEstadisticas(nuevaLista);

    try {
      await todoService.updateTodo(id, updates);
    } catch (err: unknown) {
      setTodos(listaAnterior);
      recalcularEstadisticas(listaAnterior);
      mostrarNotificacion('error', 'No se pudieron guardar los cambios.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar userEmail={userEmail} />

      <main className="app-container">
        {/* Floating Toast Notification (Minimalist) */}
        {notificacion && (
          <div
            className="animate-fade-in"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 100,
              padding: '0.65rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              background: '#18181b',
              border: '1px solid var(--border-muted)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-overlay)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.825rem',
            }}
          >
            {notificacion.type === 'success' && <CheckCircle2 size={15} color="#10b981" />}
            {notificacion.type === 'error' && <AlertCircle size={15} color="#f87171" />}
            {notificacion.type === 'info' && <CheckCircle2 size={15} color="#a1a1aa" />}
            
            <span style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {notificacion.message}
            </span>

            {/* Undo Button if applicable */}
            {notificacion.onUndo && (
              <button
                onClick={notificacion.onUndo}
                className="btn btn-secondary"
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  marginLeft: '0.4rem',
                  gap: '0.25rem'
                }}
              >
                <RotateCcw size={12} />
                <span>Deshacer</span>
              </button>
            )}

            <button
              onClick={() => setNotificacion(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.2rem'
              }}
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Dashboard Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.03em' }}>
            Mis Tareas
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Gestión y seguimiento sincronizado de actividades.
          </p>
        </div>

        {/* Minimal KPI Stats Bar */}
        <TodoStatsCards stats={stats} />

        {/* Quick Capture Input Form */}
        <TodoForm onAddTodo={handleAddTodo} />

        {/* Filters */}
        <TodoFilterBar filter={filter} onFilterChange={setFilter} />

        {/* Todo List */}
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
