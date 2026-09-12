/**
 * ==============================================================================
 * CAPA DE SERVICIOS: GESTIÓN DE TAREAS (todoService)
 * ==============================================================================
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Tarea, CrearTareaDTO, ActualizarTareaDTO, FiltroTareas, EstadisticasTareas } from '@/types/todo';

export const todoService = {
  /**
   * Obtiene la lista de tareas del usuario autenticado en Supabase.
   */
  async getTodos(filtro?: FiltroTareas): Promise<Tarea[]> {
    if (!isSupabaseConfigured()) {
      return this.getLocalMockTodos(filtro);
    }

    let query = supabase
      .from('tareas')
      .select('*')
      .order('creado_en', { ascending: false });

    if (filtro?.estado === 'completadas') {
      query = query.eq('completada', true);
    } else if (filtro?.estado === 'pendientes') {
      query = query.eq('completada', false);
    }

    if (filtro?.prioridad && filtro.prioridad !== 'todas') {
      query = query.eq('prioridad', filtro.prioridad);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener tareas de Supabase:', error);
      throw new Error(`No se pudieron cargar las tareas: ${error.message}`);
    }

    let resultados = (data || []) as Tarea[];

    if (filtro?.busqueda?.trim()) {
      const termino = filtro.busqueda.toLowerCase();
      resultados = resultados.filter(
        (t) =>
          t.titulo.toLowerCase().includes(termino) ||
          (t.descripcion && t.descripcion.toLowerCase().includes(termino))
      );
    }

    return resultados;
  },

  /**
   * Crea una nueva tarea en Supabase.
   */
  async createTodo(dto: CrearTareaDTO): Promise<Tarea> {
    if (!isSupabaseConfigured()) {
      return this.createLocalMockTodo(dto);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Debes iniciar sesión para crear una tarea.');
    }

    const { data, error } = await supabase
      .from('tareas')
      .insert({
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion?.trim() || null,
        prioridad: dto.prioridad || 'media',
        completada: false,
        usuario_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear tarea en Supabase:', error);
      throw new Error(`No se pudo crear la tarea: ${error.message}`);
    }

    return data as Tarea;
  },

  /**
   * Alterna el estado de una tarea.
   */
  async toggleTodo(id: string, completada: boolean): Promise<Tarea> {
    if (!isSupabaseConfigured()) {
      return this.toggleLocalMockTodo(id, completada);
    }

    const { data, error } = await supabase
      .from('tareas')
      .update({ completada })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar tarea:', error);
      throw new Error(`No se pudo actualizar el estado: ${error.message}`);
    }

    return data as Tarea;
  },

  /**
   * Actualiza el contenido de una tarea.
   */
  async updateTodo(id: string, updates: ActualizarTareaDTO): Promise<Tarea> {
    if (!isSupabaseConfigured()) {
      return this.updateLocalMockTodo(id, updates);
    }

    const { data, error } = await supabase
      .from('tareas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al modificar la tarea:', error);
      throw new Error(`No se pudo modificar la tarea: ${error.message}`);
    }

    return data as Tarea;
  },

  /**
   * Elimina una tarea por su ID.
   */
  async deleteTodo(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      this.deleteLocalMockTodo(id);
      return;
    }

    const { error } = await supabase.from('tareas').delete().eq('id', id);

    if (error) {
      console.error('Error al eliminar tarea:', error);
      throw new Error(`No se pudo eliminar la tarea: ${error.message}`);
    }
  },

  /**
   * Calcula las métricas de rendimiento.
   */
  async getStats(tareas: Tarea[]): Promise<EstadisticasTareas> {
    const total = tareas.length;
    const completadas = tareas.filter((t) => t.completada).length;
    const pendientes = total - completadas;
    const tasaProgreso = total > 0 ? Math.round((completadas / total) * 100) : 0;

    return {
      total,
      completadas,
      pendientes,
      tasaProgreso,
    };
  },

  // =========================================================================
  // PERSISTENCIA LOCAL LIMPIA (0 tareas precargadas por defecto)
  // =========================================================================
  _getLocalStorageTodos(): Tarea[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('__taller_ia_tareas__');
      if (stored) return JSON.parse(stored);
    } catch {}
    // Siempre empieza vacío, sin tareas precargadas de demostración
    return [];
  },

  _saveLocalStorageTodos(tareas: Tarea[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('__taller_ia_tareas__', JSON.stringify(tareas));
    } catch {}
  },

  getLocalMockTodos(filtro?: FiltroTareas): Tarea[] {
    let items = this._getLocalStorageTodos();
    if (filtro?.estado === 'completadas') items = items.filter((t) => t.completada);
    if (filtro?.estado === 'pendientes') items = items.filter((t) => !t.completada);
    if (filtro?.prioridad && filtro.prioridad !== 'todas') items = items.filter((t) => t.prioridad === filtro.prioridad);
    if (filtro?.busqueda?.trim()) {
      const term = filtro.busqueda.toLowerCase();
      items = items.filter((t) => t.titulo.toLowerCase().includes(term) || (t.descripcion && t.descripcion.toLowerCase().includes(term)));
    }
    return items;
  },

  createLocalMockTodo(dto: CrearTareaDTO): Tarea {
    const tareas = this._getLocalStorageTodos();
    const nueva: Tarea = {
      id: 'local-' + Date.now(),
      usuario_id: 'local-user',
      titulo: dto.titulo,
      descripcion: dto.descripcion || null,
      prioridad: dto.prioridad || 'media',
      completada: false,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    };
    tareas.unshift(nueva);
    this._saveLocalStorageTodos(tareas);
    return nueva;
  },

  toggleLocalMockTodo(id: string, completada: boolean): Tarea {
    const tareas = this._getLocalStorageTodos();
    const index = tareas.findIndex((t) => t.id === id);
    if (index !== -1) {
      tareas[index].completada = completada;
      tareas[index].actualizado_en = new Date().toISOString();
      this._saveLocalStorageTodos(tareas);
      return tareas[index];
    }
    throw new Error('Tarea no encontrada.');
  },

  updateLocalMockTodo(id: string, updates: ActualizarTareaDTO): Tarea {
    const tareas = this._getLocalStorageTodos();
    const index = tareas.findIndex((t) => t.id === id);
    if (index !== -1) {
      tareas[index] = { ...tareas[index], ...updates, actualizado_en: new Date().toISOString() };
      this._saveLocalStorageTodos(tareas);
      return tareas[index];
    }
    throw new Error('Tarea no encontrada.');
  },

  deleteLocalMockTodo(id: string): void {
    const tareas = this._getLocalStorageTodos().filter((t) => t.id !== id);
    this._saveLocalStorageTodos(tareas);
  },
};
