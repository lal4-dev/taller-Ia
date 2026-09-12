'use client';

/**
 * ==============================================================================
 * PÁGINA: PANEL PRINCIPAL DE TAREAS (/dashboard)
 * ==============================================================================
 * Arquitectura de Estado Unificada:
 * 1. Mantiene el conjunto total de tareas (`todasLasTareas`) del usuario.
 * 2. Las métricas (Total, Pendientes, Completadas, Avance) siempre reflejan el
 *    progreso global del usuario sin distorsionarse al aplicar filtros.
 * 3. Las tareas visibles (`tareasFiltradas`) se calculan en memoria con `useMemo`.
 * 4. Actualizaciones optimistas a 0 ms con soporte de Deshacer (Undo).
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { TodoStatsCards } from '@/components/todos/TodoStatsCards';
import { TodoForm } from '@/components/todos/TodoForm';
import { TodoFilterBar } from '@/components/todos/TodoFilterBar';
import { TodoList } from '@/components/todos/TodoList';
import { todoService } from '@/services/todoService';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Tarea, CrearTareaDTO, ActualizarTareaDTO, FiltroTareas } from '@/types/todo';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, RotateCcw, X } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  // Estados reactivos principales
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [todasLasTareas, setTodasLasTareas] = useState<Tarea[]>([]);
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

  /**
   * Cálculo de métricas globales (siempre sobre la totalidad de tareas del usuario)
   */
  const stats = useMemo(() => {
    const total = todasLasTareas.length;
    const completadas = todasLasTareas.filter((t) => t.completada).length;
    const pendientes = total - completadas;
    const tasaProgreso = total > 0 ? Math.round((completadas / total) * 100) : 0;
    return { total, completadas, pendientes, tasaProgreso };
  }, [todasLasTareas]);

  /**
   * Filtrado en memoria instantáneo (0 ms) para las tareas que se muestran en pantalla
   */
  const tareasFiltradas = useMemo(() => {
    return todasLasTareas.filter((t) => {
      // 1. Filtro por estado
      if (filter.estado === 'completadas' && !t.completada) return false;
      if (filter.estado === 'pendientes' && t.completada) return false;

      // 2. Filtro por nivel de prioridad
      if (filter.prioridad && filter.prioridad !== 'todas' && t.prioridad !== filter.prioridad) {
        return false;
      }

      // 3. Filtro por búsqueda de texto
      if (filter.busqueda?.trim()) {
        const termino = filter.busqueda.toLowerCase();
        const coincideTitulo = t.titulo.toLowerCase().includes(termino);
        const coincideDesc = t.descripcion ? t.descripcion.toLowerCase().includes(termino) : false;
        if (!coincideTitulo && !coincideDesc) return false;
      }

      return true;
    });
  }, [todasLasTareas, filter]);

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
   * Carga de datos inicial desde Supabase
   */
  const cargarDatos = useCallback(async (mostrarEsqueleto = false) => {
    try {
      if (mostrarEsqueleto) setIsLoading(true);
      const items = await todoService.getTodos();
      setTodasLasTareas(items);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al sincronizar las tareas';
      mostrarNotificacion('error', msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const inicializar = async () => {
      const usuario = await authService.getCurrentUser();
      if (!usuario) {
        router.replace('/login');
        return;
      }
      setUserEmail(usuario.email || 'Usuario');
      cargarDatos(true);
    };

    inicializar();
  }, [router, cargarDatos]);

  // =========================================================================
  // OPERACIONES OPTIMISTAS (0 ms DE LATENCIA)
  // =========================================================================

  /** Crear tarea */
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

    // Inserción optimista inmediata
    setTodasLasTareas((prev) => [tareaOptimista, ...prev]);

    try {
      const creada = await todoService.createTodo(dto);
      setTodasLasTareas((prev) => prev.map((t) => (t.id === idTemporal ? creada : t)));
    } catch (err: unknown) {
      setTodasLasTareas((prev) => prev.filter((t) => t.id !== idTemporal));
      const msg = err instanceof Error ? err.message : 'No se pudo guardar la tarea';
      mostrarNotificacion('error', msg);
    }
  };

  /** Alternar estado de completitud */
  const handleToggle = async (id: string, nuevoEstado: boolean) => {
    const listaAnterior = [...todasLasTareas];
    setTodasLasTareas((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completada: nuevoEstado, actualizado_en: new Date().toISOString() } : t
      )
    );

    try {
      await todoService.toggleTodo(id, nuevoEstado);
    } catch {
      setTodasLasTareas(listaAnterior);
      mostrarNotificacion('error', 'Error al sincronizar el estado.');
    }
  };

  /** Eliminar tarea con soporte para Deshacer (Undo) */
  const handleDelete = async (id: string) => {
    const tareaEliminada = todasLasTareas.find((t) => t.id === id);
    if (!tareaEliminada) return;

    const listaAnterior = [...todasLasTareas];
    setTodasLasTareas((prev) => prev.filter((t) => t.id !== id));

    let cancelado = false;

    mostrarNotificacion('info', `Tarea "${tareaEliminada.titulo}" eliminada.`, () => {
      cancelado = true;
      setTodasLasTareas(listaAnterior);
      setNotificacion(null);
    });

    setTimeout(async () => {
      if (!cancelado) {
        try {
          await todoService.deleteTodo(id);
        } catch {
          setTodasLasTareas(listaAnterior);
        }
      }
    }, 4500);
  };

  /** Actualizar tarea */
  const handleUpdate = async (id: string, updates: ActualizarTareaDTO) => {
    const listaAnterior = [...todasLasTareas];
    setTodasLasTareas((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...updates, actualizado_en: new Date().toISOString() } : t
      )
    );

    try {
      await todoService.updateTodo(id, updates);
    } catch {
      setTodasLasTareas(listaAnterior);
      mostrarNotificacion('error', 'No se pudieron guardar los cambios.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar userEmail={userEmail} />

      <main className="app-container">
        {/* Notificación flotante (Toast) */}
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

            {/* Botón Deshacer */}
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

        {/* Encabezado */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.03em' }}>
            Mis Tareas
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Gestión y seguimiento sincronizado de actividades.
          </p>
        </div>

        {/* Barra de Métricas Globales (Siempre precisa e independiente del filtro) */}
        <TodoStatsCards stats={stats} />

        {/* Formulario de Entrada */}
        <TodoForm onAddTodo={handleAddTodo} />

        {/* Filtros */}
        <TodoFilterBar filter={filter} onFilterChange={setFilter} />

        {/* Lista de Tareas Filtradas */}
        <TodoList
          todos={tareasFiltradas}
          isLoading={isLoading}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </main>
    </div>
  );
}
