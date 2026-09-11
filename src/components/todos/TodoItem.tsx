'use client';

/**
 * ==============================================================================
 * COMPONENTE: ELEMENTO DE TAREA (TodoItem)
 * ==============================================================================
 * Representa una tarea individual en la lista con capacidades interactivas:
 * 1. Marcar como completada o pendiente con botón de verificación accesible.
 * 2. Modo de edición en línea (Inline Edit) para cambiar título, descripción y prioridad.
 * 3. Eliminación con feedback visual inmediato.
 * 4. Borde de color dinámico según la prioridad (Rojo = Alta, Amarillo = Media, Azul/Verde = Baja).
 */

import React, { useState } from 'react';
import { Todo, PriorityLevel, UpdateTodoDTO } from '@/types/todo';
import { Check, Trash2, Edit2, X, Save, Calendar } from 'lucide-react';

interface TodoItemProps {
  /** Objeto de la tarea a renderizar */
  todo: Todo;
  /** Función para alternar el estado de completitud */
  onToggle: (id: string, is_completed: boolean) => Promise<void>;
  /** Función para eliminar la tarea */
  onDelete: (id: string) => Promise<void>;
  /** Función para actualizar el contenido de la tarea */
  onUpdate: (id: string, updates: UpdateTodoDTO) => Promise<void>;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onUpdate }) => {
  // Estado para controlar si el elemento está en modo de edición en línea
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para los valores en edición
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState<PriorityLevel>(todo.priority);
  
  // Estados de carga para evitar doble clic o peticiones concurrentes
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  /**
   * Ejecuta el cambio de estado (completado/pendiente)
   */
  const handleToggle = async () => {
    try {
      setIsToggling(true);
      await onToggle(todo.id, !todo.is_completed);
    } finally {
      setIsToggling(false);
    }
  };

  /**
   * Ejecuta el borrado de la tarea
   */
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(todo.id);
    } catch {
      setIsDeleting(false);
    }
  };

  /**
   * Guarda los cambios modificados en el modo edición
   */
  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    await onUpdate(todo.id, {
      title: editTitle.trim(),
      description: editDesc.trim() || undefined,
      priority: editPriority,
    });
    setIsEditing(false);
  };

  /**
   * Formatea una fecha ISO a un formato legible en español (ej: "11 sept, 18:30")
   */
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return '';
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.15rem 1.25rem',
        marginBottom: '0.85rem',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isDeleting ? 0.4 : 1,
        transform: isDeleting ? 'scale(0.98)' : 'scale(1)',
        borderLeft: todo.is_completed
          ? '4px solid var(--accent-success)'
          : todo.priority === 'high'
          ? '4px solid var(--accent-danger)'
          : todo.priority === 'medium'
          ? '4px solid var(--accent-warning)'
          : '4px solid var(--accent-primary)',
      }}
    >
      {!isEditing ? (
        /* Modo Visualización Normal */
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Checkbox personalizado y Contenido de texto */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1 }}>
            {/* Botón de Checkbox */}
            <button
              type="button"
              onClick={handleToggle}
              disabled={isToggling}
              aria-label={todo.is_completed ? 'Marcar como pendiente' : 'Marcar como completada'}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                border: todo.is_completed
                  ? '2px solid var(--accent-success)'
                  : '2px solid rgba(255, 255, 255, 0.25)',
                background: todo.is_completed ? 'var(--accent-success)' : 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                marginTop: '2px',
                transition: 'all var(--transition-fast)'
              }}
            >
              {todo.is_completed && <Check size={16} color="#ffffff" strokeWidth={3} />}
            </button>

            {/* Título, Descripción y Metadatos */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: todo.is_completed ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: todo.is_completed ? 'line-through' : 'none',
                wordBreak: 'break-word',
                transition: 'color var(--transition-fast)'
              }}>
                {todo.title}
              </div>

              {/* Descripción opcional */}
              {todo.description && (
                <div style={{
                  fontSize: '0.875rem',
                  color: todo.is_completed ? 'rgba(148, 163, 184, 0.5)' : 'var(--text-secondary)',
                  marginTop: '0.35rem',
                  lineHeight: 1.4,
                  wordBreak: 'break-word'
                }}>
                  {todo.description}
                </div>
              )}

              {/* Badges de Prioridad y Fecha de creación */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.65rem' }}>
                <span className={`badge badge-${todo.priority}`}>
                  {todo.priority === 'high' ? 'Alta' : todo.priority === 'medium' ? 'Media' : 'Baja'}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Calendar size={13} />
                  <span>{formatDate(todo.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción: Editar y Borrar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-ghost"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)'
              }}
              title="Editar tarea"
            >
              <Edit2 size={16} />
            </button>

            <button
              onClick={handleDelete}
              className="btn-danger-ghost"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
              }}
              title="Eliminar tarea"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Modo Edición en Línea (Inline Edit) */
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <input
            type="text"
            className="input-field"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Título de la tarea..."
            autoFocus
          />

          <textarea
            className="input-field"
            rows={2}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Descripción (opcional)..."
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <select
              className="select-field"
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
              style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            >
              <option value="low">🟢 Baja</option>
              <option value="medium">🟡 Media</option>
              <option value="high">🔴 Alta</option>
            </select>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
              >
                <X size={15} />
                <span>Cancelar</span>
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="btn btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                <Save size={15} />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
