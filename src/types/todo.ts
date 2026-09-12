/**
 * ==============================================================================
 * MODELOS DE DOMINIO Y TIPOS TYPESCRIPT EN ESPAÑOL (TAREAS)
 * ==============================================================================
 * Este archivo define las estructuras de datos que representan las tareas,
 * los filtros y los cálculos estadísticos en la aplicación con nombres en español.
 */

/**
 * Niveles de prioridad en español para clasificar una tarea.
 * - 'baja': Prioridad Baja (🟢 Verde)
 * - 'media': Prioridad Media (🟡 Amarillo)
 * - 'alta': Prioridad Alta (🔴 Rojo)
 */
export type NivelPrioridad = 'baja' | 'media' | 'alta';
export type PriorityLevel = NivelPrioridad;

/**
 * Entidad completa de una Tarea (refleja la tabla `tareas` en PostgreSQL).
 */
export interface Tarea {
  /** Identificador único universal (UUID) de la tarea */
  id: string;
  /** UUID del usuario propietario (vinculado a auth.users en Supabase) */
  usuario_id: string;
  /** Título o descripción principal de la tarea */
  titulo: string;
  /** Descripción o notas adicionales (opcional) */
  descripcion?: string | null;
  /** Nivel de urgencia o prioridad de la tarea */
  prioridad: NivelPrioridad;
  /** Estado de realización: true si ya fue completada, false si está pendiente */
  completada: boolean;
  /** Fecha y hora ISO de creación */
  creado_en: string;
  /** Fecha y hora ISO de la última modificación */
  actualizado_en: string;
}

// Alias para compatibilidad
export type Todo = Tarea;

/**
 * Objeto de Transferencia de Datos (DTO) para crear una nueva tarea.
 */
export interface CrearTareaDTO {
  titulo: string;
  descripcion?: string;
  prioridad?: NivelPrioridad;
}
export type CreateTodoDTO = CrearTareaDTO;

/**
 * Objeto de Transferencia de Datos (DTO) para editar una tarea existente.
 */
export interface ActualizarTareaDTO {
  titulo?: string;
  descripcion?: string;
  prioridad?: NivelPrioridad;
  completada?: boolean;
}
export type UpdateTodoDTO = ActualizarTareaDTO;

/**
 * Opciones de filtrado por estado de completitud.
 */
export type EstadoFiltroTarea = 'todas' | 'pendientes' | 'completadas';
export type TodoFilterStatus = EstadoFiltroTarea;

/**
 * Parámetros de búsqueda y filtrado activo en la interfaz de usuario.
 */
export interface FiltroTareas {
  /** Filtrar por estado: 'todas', 'pendientes', 'completadas' */
  estado: EstadoFiltroTarea;
  /** Texto para búsqueda en vivo por título o descripción */
  busqueda?: string;
  /** Filtrar por nivel de prioridad específico o 'todas' */
  prioridad?: NivelPrioridad | 'todas';
}
export type TodoFilter = FiltroTareas;

/**
 * Métricas agregadas de productividad calculadas para el usuario.
 */
export interface EstadisticasTareas {
  /** Cantidad total de tareas registradas */
  total: number;
  /** Cantidad de tareas finalizadas */
  completadas: number;
  /** Cantidad de tareas pendientes */
  pendientes: number;
  /** Porcentaje de avance completado (0 a 100) */
  tasaProgreso: number;
}
export type TodoStats = EstadisticasTareas;
