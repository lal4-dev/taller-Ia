/**
 * ==============================================================================
 * CAPA DE SERVICIOS: GESTIÓN DE TAREAS (todoService)
 * ==============================================================================
 * Este servicio implementa todas las operaciones CRUD (Crear, Leer, Actualizar, Borrar)
 * sobre la base de datos PostgreSQL en Supabase.
 * 
 * Aspectos clave de seguridad y arquitectura:
 * 1. Cada consulta HTTP incluye automáticamente el token JWT del usuario actual.
 * 2. Las políticas de Row Level Security (RLS) en PostgreSQL aseguran que cada usuario
 *    únicamente pueda acceder y manipular sus propias filas.
 * 3. Incluye un mecanismo de almacenamiento local (Mock Storage) como fallback para
 *    permitir probar la interfaz inmediatamente antes de configurar Supabase.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Todo, CreateTodoDTO, UpdateTodoDTO, TodoFilter, TodoStats } from '@/types/todo';

export const todoService = {
  /**
   * Obtiene la lista de tareas del usuario autenticado aplicando filtros opcionales.
   * 
   * @param {TodoFilter} [filter] - Filtros de estado ('all', 'pending', 'completed'), prioridad o texto.
   * @returns {Promise<Todo[]>} Lista de tareas ordenadas cronológicamente de más reciente a más antigua.
   */
  async getTodos(filter?: TodoFilter): Promise<Todo[]> {
    // Si Supabase no está configurado, usamos el almacenamiento local para demostración
    if (!isSupabaseConfigured()) {
      return this.getLocalMockTodos(filter);
    }

    // Construcción de la consulta estructurada en Supabase
    let query = supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtrar por estado de completado si no se pide 'all'
    if (filter?.status === 'completed') {
      query = query.eq('is_completed', true);
    } else if (filter?.status === 'pending') {
      query = query.eq('is_completed', false);
    }

    // Filtrar por nivel de prioridad específico
    if (filter?.priority && filter.priority !== 'all') {
      query = query.eq('priority', filter.priority);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener tareas de Supabase:', error);
      throw new Error(`No se pudieron cargar las tareas: ${error.message}`);
    }

    let resultados = (data || []) as Todo[];

    // Filtrado en memoria por término de búsqueda (título o descripción)
    if (filter?.searchQuery?.trim()) {
      const termino = filter.searchQuery.toLowerCase();
      resultados = resultados.filter(
        (t) =>
          t.title.toLowerCase().includes(termino) ||
          (t.description && t.description.toLowerCase().includes(termino))
      );
    }

    return resultados;
  },

  /**
   * Crea una nueva tarea en Supabase asociada al ID del usuario autenticado.
   * 
   * @param {CreateTodoDTO} dto - Título, descripción opcional y prioridad.
   * @returns {Promise<Todo>} La tarea recién creada con su ID generado por la base de datos.
   */
  async createTodo(dto: CreateTodoDTO): Promise<Todo> {
    if (!isSupabaseConfigured()) {
      return this.createLocalMockTodo(dto);
    }

    // Obtenemos el usuario autenticado para asignarlo a la columna user_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Debes iniciar sesión para crear una tarea.');
    }

    const { data, error } = await supabase
      .from('todos')
      .insert({
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        priority: dto.priority || 'medium',
        is_completed: false,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear tarea en Supabase:', error);
      throw new Error(`No se pudo crear la tarea: ${error.message}`);
    }

    return data as Todo;
  },

  /**
   * Alterna el estado de una tarea entre completada y pendiente.
   * 
   * @param {string} id - UUID de la tarea a modificar.
   * @param {boolean} is_completed - Nuevo estado booleano.
   * @returns {Promise<Todo>} La tarea con el estado actualizado.
   */
  async toggleTodo(id: string, is_completed: boolean): Promise<Todo> {
    if (!isSupabaseConfigured()) {
      return this.toggleLocalMockTodo(id, is_completed);
    }

    const { data, error } = await supabase
      .from('todos')
      .update({ is_completed })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar tarea:', error);
      throw new Error(`No se pudo actualizar el estado: ${error.message}`);
    }

    return data as Todo;
  },

  /**
   * Actualiza los campos de una tarea existente (título, descripción, prioridad).
   * 
   * @param {string} id - UUID de la tarea.
   * @param {UpdateTodoDTO} updates - Campos a modificar.
   * @returns {Promise<Todo>} La tarea actualizada.
   */
  async updateTodo(id: string, updates: UpdateTodoDTO): Promise<Todo> {
    if (!isSupabaseConfigured()) {
      return this.updateLocalMockTodo(id, updates);
    }

    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al modificar la tarea:', error);
      throw new Error(`No se pudo modificar la tarea: ${error.message}`);
    }

    return data as Todo;
  },

  /**
   * Elimina permanentemente una tarea de la base de datos por su ID.
   * 
   * @param {string} id - UUID de la tarea a eliminar.
   */
  async deleteTodo(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      this.deleteLocalMockTodo(id);
      return;
    }

    const { error } = await supabase.from('todos').delete().eq('id', id);

    if (error) {
      console.error('Error al eliminar tarea:', error);
      throw new Error(`No se pudo eliminar la tarea: ${error.message}`);
    }
  },

  /**
   * Calcula las métricas de rendimiento y productividad del usuario a partir de un arreglo de tareas.
   * 
   * @param {Todo[]} todos - Lista de tareas a evaluar.
   * @returns {Promise<TodoStats>} Métricas de total, completadas, pendientes y porcentaje.
   */
  async getStats(todos: Todo[]): Promise<TodoStats> {
    const total = todos.length;
    const completed = todos.filter((t) => t.is_completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      completionRate,
    };
  },

  // =========================================================================
  // MÓDULO DE PERSISTENCIA LOCAL (MOCK / OFFLINE)
  // =========================================================================
  
  /** Lee las tareas almacenadas en el LocalStorage del navegador */
  _getLocalStorageTodos(): Todo[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('__taller_ia_mock_todos__');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'mock-1',
        user_id: 'local-user',
        title: 'Configurar variables de Supabase en .env.local',
        description: 'Pega tu NEXT_PUBLIC_SUPABASE_URL y ANON_KEY para conectar con la nube.',
        priority: 'high',
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'mock-2',
        user_id: 'local-user',
        title: 'Ejecutar el script SQL en el editor de Supabase',
        description: 'Revisa docs/SUPABASE_SETUP.md para crear la tabla con políticas RLS.',
        priority: 'medium',
        is_completed: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'mock-3',
        user_id: 'local-user',
        title: 'Explorar la arquitectura en docs/ARCHITECTURE.md',
        description: 'Comprende el flujo de datos entre UI, Servicios y Base de datos.',
        priority: 'low',
        is_completed: true,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  },

  /** Guarda las tareas en el LocalStorage del navegador */
  _saveLocalStorageTodos(todos: Todo[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('__taller_ia_mock_todos__', JSON.stringify(todos));
    } catch {}
  },

  /** Obtiene las tareas locales aplicando filtros */
  getLocalMockTodos(filter?: TodoFilter): Todo[] {
    let items = this._getLocalStorageTodos();
    if (filter?.status === 'completed') items = items.filter((t) => t.is_completed);
    if (filter?.status === 'pending') items = items.filter((t) => !t.is_completed);
    if (filter?.priority && filter.priority !== 'all') items = items.filter((t) => t.priority === filter.priority);
    if (filter?.searchQuery?.trim()) {
      const term = filter.searchQuery.toLowerCase();
      items = items.filter((t) => t.title.toLowerCase().includes(term) || (t.description && t.description.toLowerCase().includes(term)));
    }
    return items;
  },

  /** Crea una nueva tarea en memoria local */
  createLocalMockTodo(dto: CreateTodoDTO): Todo {
    const todos = this._getLocalStorageTodos();
    const newTodo: Todo = {
      id: 'local-' + Date.now(),
      user_id: 'local-user',
      title: dto.title,
      description: dto.description || null,
      priority: dto.priority || 'medium',
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    todos.unshift(newTodo);
    this._saveLocalStorageTodos(todos);
    return newTodo;
  },

  /** Alterna el estado de una tarea local */
  toggleLocalMockTodo(id: string, is_completed: boolean): Todo {
    const todos = this._getLocalStorageTodos();
    const index = todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos[index].is_completed = is_completed;
      todos[index].updated_at = new Date().toISOString();
      this._saveLocalStorageTodos(todos);
      return todos[index];
    }
    throw new Error('Tarea no encontrada.');
  },

  /** Actualiza los datos de una tarea local */
  updateLocalMockTodo(id: string, updates: UpdateTodoDTO): Todo {
    const todos = this._getLocalStorageTodos();
    const index = todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates, updated_at: new Date().toISOString() };
      this._saveLocalStorageTodos(todos);
      return todos[index];
    }
    throw new Error('Tarea no encontrada.');
  },

  /** Elimina una tarea local */
  deleteLocalMockTodo(id: string): void {
    const todos = this._getLocalStorageTodos().filter((t) => t.id !== id);
    this._saveLocalStorageTodos(todos);
  },
};
