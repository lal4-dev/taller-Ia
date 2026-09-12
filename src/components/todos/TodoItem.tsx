'use client';

/**
 * ==============================================================================
 * COMPONENTE: ELEMENTO DE TAREA (TodoItem / ElementoTarea)
 * ==============================================================================
 */

import React, { useState } from 'react';
import { Tarea, NivelPrioridad, ActualizarTareaDTO } from '@/types/todo';
import { Check, Trash2, Edit2, X, Save, Calendar } from 'lucide-react';

interface TodoItemProps {
  /** Objeto de la tarea */
  todo: Tarea;
  /** Función para alternar el estado de completitud */
  onToggle: (id: string, completada: boolean) => Promise<void>;
  /** Función para eliminar la tarea */
  onDelete: (id: string) => Promise<void>;
  /** Función para actualizar el contenido de la tarea */
  onUpdate: (id: string, updates: ActualizarTareaDTO) => Promise<void>;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Valores en edición
  const [editTitulo, setEditTitulo] = useState(todo.titulo);
  const [editDesc, setEditDesc] = useState(todo.descripcion || '');
  const [editPrioridad, setEditPrioridad] = useState<NivelPrioridad>(todo.prioridad);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    try {
      setIsToggling(true);
      await onToggle(todo.id, !todo.completada);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(todo.id);
    } catch {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitulo.trim()) return;
    await onUpdate(todo.id, {
      titulo: editTitulo.trim(),
      descripcion: editDesc.trim() || undefined,
      prioridad: editPrioridad,
    });
    setIsEditing(false);
  };

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
        borderLeft: todo.completada
          ? '4px solid var(--accent-success)'
          : todo.prioridad === 'alta'
          ? '4px solid var(--accent-danger)'
          : todo.prioridad === 'media'
          ? '4px solid var(--accent-warning)'
          : '4px solid var(--accent-primary)',
      }}
    >
      {!isEditing ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Checkbox y Contenido */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1 }}>
            <button
              type="button"
              onClick={handleToggle}
              disabled={isToggling}
              aria-label={todo.completada ? 'Marcar como pendiente' : 'Marcar como completada'}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                border: todo.completada
                  ? '2px solid var(--accent-success)'
                  : '2px solid rgba(255, 255, 255, 0.25)',
                background: todo.completada ? 'var(--accent-success)' : 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                marginTop: '2px',
                transition: 'all var(--transition-fast)'
              }}
            >
              {todo.completada && <Check size={16} color="#ffffff" strokeWidth={3} />}
            </button>

            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: todo.completada ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: todo.completada ? 'line-through' : 'none',
                wordBreak: 'break-word',
                transition: 'color var(--transition-fast)'
              }}>
                {todo.titulo}
              </div>

              {todo.descripcion && (
                <div style={{
                  fontSize: '0.875rem',
                  color: todo.completada ? 'rgba(148, 163, 184, 0.5)' : 'var(--text-secondary)',
                  marginTop: '0.35rem',
                  lineHeight: 1.4,
                  wordBreak: 'break-word'
                }}>
                  {todo.descripcion}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.65rem' }}>
                <span className={`badge badge-${todo.prioridad === 'alta' ? 'high' : todo.prioridad === 'media' ? 'medium' : 'low'}`}>
                  {todo.prioridad === 'alta' ? 'Alta' : todo.prioridad === 'media' ? 'Media' : 'Baja'}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Calendar size={13} />
                  <span>{formatDate(todo.creado_en)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
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
        /* Modo Edición en Línea */
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <input
            type="text"
            className="input-field"
            value={editTitulo}
            onChange={(e) => setEditTitulo(e.target.value)}
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
              value={editPrioridad}
              onChange={(e) => setEditPrioridad(e.target.value as NivelPrioridad)}
              style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            >
              <option value="baja">🟢 Baja</option>
              <option value="media">🟡 Media</option>
              <option value="alta">🔴 Alta</option>
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
