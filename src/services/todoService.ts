/**
 * ==============================================================================
 * CAPA DE SERVICIOS: GESTIÓN DE TAREAS (todoService / servicioTareas)
 * ==============================================================================
 * Este servicio implementa todas las operaciones CRUD sobre la tabla `tareas`
 * en la base de datos PostgreSQL de Supabase.
 * 
 * - Consultas estructuradas con nombres de columnas en español.
 * - Seguridad por usuario evaluada mediante RLS (`auth.uid() = usuario_id`).
 * - Módulo de persistencia local (Mock Storage) como respaldo.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Tarea, CrearTareaDTO, ActualizarTareaDTO, FiltroTareas, EstadisticasTareas } from '@/types/todo';

export const todoService = {
  /**
   * Obtiene la lista de tareas del usuario autenticado aplicando filtros opcionales.
   * 
   * @param {FiltroTareas} [filtro] - Filtros de estado ('todas', 'pendientes', 'completadas'), prioridad o búsqueda.
   * @returns {Promise<Tarea[]>} Lista de tareas ordenadas de más reciente a más antigua.
   */
  async getTodos(filtro?: FiltroTareas): Promise<Tarea[]> {
    if (!isSupabaseConfigured()) {
      return this.getLocalMockTodos(filtro);
    }

    let query = supabase
      .from('tareas')
      .select('*')
      .order('creado_en', { ascending: false });

    // Filtrar por estado de completado
    if (filtro?.estado === 'completadas') {
      query = query.eq('completada', true);
    } else if (filtro?.estado === 'pendientes') {
      query = query.eq('completada', false);
    }

    // Filtrar por nivel de prioridad específico
    if (filtro?.prioridad && filtro.prioridad !== 'todas') {
      query = query.eq('prioridad', filtro.prioridad);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener tareas de Supabase:', error);
      throw new Error(`No se pudieron cargar las tareas: ${error.message}`);
    }

    let resultados = (data || []) as Tarea[];

    // Filtrado en memoria por término de búsqueda (título o descripción)
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
   * Crea una nueva tarea en Supabase asociada al ID del usuario autenticado.
   * 
   * @param {CrearTareaDTO} dto - Título, descripción y prioridad.
   * @returns {Promise<Tarea>} La tarea creada.
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
   * Alterna el estado de completado de una tarea.
   * 
   * @param {string} id - UUID de la tarea.
   * @param {boolean} completada - Nuevo estado booleano.
   * @returns {Promise<Tarea>} La tarea actualizada.
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
   * Actualiza los campos de una tarea existente.
   * 
   * @param {string} id - UUID de la tarea.
   * @param {ActualizarTareaDTO} updates - Campos a modificar.
   * @returns {Promise<Tarea>} La tarea modificada.
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
   * 
   * @param {string} id - UUID de la tarea a eliminar.
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
   * Calcula las métricas de rendimiento del usuario.
   * 
   * @param {Tarea[]} tareas - Lista de tareas a evaluar.
   * @returns {Promise<EstadisticasTareas>}
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
  // PERSISTENCIA LOCAL MOCK
  // =========================================================================
  _getLocalStorageTodos(): Tarea[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('__taller_ia_mock_tareas__');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'mock-1',
        usuario_id: 'local-user',
        titulo: 'Configuración en español de Supabase completada',
        descripcion: 'La tabla `tareas` y sus columnas están 100% en español.',
        prioridad: 'alta',
        completada: false,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      },
      {
        id: 'mock-2',
        usuario_id: 'local-user',
        titulo: 'Políticas RLS en español activas',
        descripcion: 'Cada usuario solo accede a sus tareas en la nube.',
        prioridad: 'media',
        completada: false,
        creado_en: new Date(Date.now() - 3600000).toISOString(),
        actualizado_en: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'mock-3',
        usuario_id: 'local-user',
        titulo: 'Consultar especificación OpenSpec',
        descripcion: 'Verificar contratos de datos y rutas en /api/openapi.',
        prioridad: 'baja',
        completada: true,
        creado_en: new Date(Date.now() - 7200000).toISOString(),
        actualizado_en: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  },

  _saveLocalStorageTodos(tareas: Tarea[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('__taller_ia_mock_tareas__', JSON.stringify(tareas));
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

export const servicioTareas = todoService;
