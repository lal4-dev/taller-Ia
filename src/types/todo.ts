/**
 * ==============================================================================
 * MODELOS DE DOMINIO Y TIPOS TYPESCRIPT (TAREAS Y MÉTRICAS)
 * ==============================================================================
 * Este archivo define las estructuras de datos que representan las tareas,
 * los filtros y los cálculos estadísticos en la aplicación.
 */

/**
 * Niveles de prioridad permitidos para clasificar una tarea.
 * - 'low': Prioridad Baja (Color verde)
 * - 'medium': Prioridad Media (Color amarillo)
 * - 'high': Prioridad Alta (Color rojo)
 */
export type PriorityLevel = 'low' | 'medium' | 'high';

/**
 * Entidad completa de una Tarea (refleja una fila de la tabla `todos` en PostgreSQL).
 */
export interface Todo {
  /** Identificador único universal (UUID) de la tarea */
  id: string;
  /** UUID del usuario propietario (vinculado a auth.users en Supabase) */
  user_id: string;
  /** Título o descripción principal de la tarea */
  title: string;
  /** Descripción o notas adicionales (opcional) */
  description?: string | null;
  /** Nivel de urgencia o prioridad de la tarea */
  priority: PriorityLevel;
  /** Estado de realización: true si ya fue completada, false si está pendiente */
  is_completed: boolean;
  /** Fecha y hora ISO de creación */
  created_at: string;
  /** Fecha y hora ISO de la última modificación */
  updated_at: string;
}

/**
 * Objeto de Transferencia de Datos (DTO) para crear una nueva tarea.
 * Contiene únicamente los campos requeridos y opcionales que el usuario puede enviar.
 */
export interface CreateTodoDTO {
  title: string;
  description?: string;
  priority?: PriorityLevel;
}

/**
 * Objeto de Transferencia de Datos (DTO) para editar una tarea existente.
 * Todos los campos son opcionales para permitir actualizaciones parciales (PATCH).
 */
export interface UpdateTodoDTO {
  title?: string;
  description?: string;
  priority?: PriorityLevel;
  is_completed?: boolean;
}

/**
 * Opciones de filtrado por estado de completitud.
 */
export type TodoFilterStatus = 'all' | 'pending' | 'completed';

/**
 * Parámetros de búsqueda y filtrado activo en la interfaz de usuario.
 */
export interface TodoFilter {
  /** Filtrar por estado: 'all' (todas), 'pending' (pendientes), 'completed' (completadas) */
  status: TodoFilterStatus;
  /** Texto para búsqueda en vivo por título o descripción */
  searchQuery?: string;
  /** Filtrar por nivel de prioridad específico o 'all' para todas */
  priority?: PriorityLevel | 'all';
}

/**
 * Métricas agregadas de productividad calculadas para el usuario.
 */
export interface TodoStats {
  /** Cantidad total de tareas registradas */
  total: number;
  /** Cantidad de tareas finalizadas */
  completed: number;
  /** Cantidad de tareas que faltan por realizar */
  pending: number;
  /** Porcentaje de avance completado (0 a 100) */
  completionRate: number;
}
