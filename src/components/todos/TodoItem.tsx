'use client';

/**
 * ==============================================================================
 * COMPONENTE: FILA DE TAREA (TodoItem)
 * ==============================================================================
 * Estilo Linear: limpio, fila compacta, acciones visibles en hover y tipografía nítida.
 */

import React, { useState } from 'react';
import { Tarea, NivelPrioridad, ActualizarTareaDTO } from '@/types/todo';
import { Check, Trash2, Edit2, X, Save } from 'lucide-react';

interface TodoItemProps {
  todo: Tarea;
  onToggle: (id: string, completada: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: ActualizarTareaDTO) => Promise<void>;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitulo, setEditTitulo] = useState(todo.titulo);
  const [editDesc, setEditDesc] = useState(todo.descripcion || '');
  const [editPrioridad, setEditPrioridad] = useState<NivelPrioridad>(todo.prioridad);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = async () => {
    await onToggle(todo.id, !todo.completada);
  };

  const handleDelete = async () => {
    await onDelete(todo.id);
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
      }).format(date);
    } catch {
      return '';
    }
  };

  return (
    <div
      className="pro-card todo-item-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isEditing ? (
        <div className="todo-item-main-row">
          {/* Checkbox & Main Info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', flex: 1, minWidth: 0 }}>
            {/* Minimalist Checkbox with touch-friendly hit area */}
            <button
              type="button"
              onClick={handleToggle}
              aria-label={todo.completada ? 'Marcar como pendiente' : 'Marcar como completada'}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                border: todo.completada ? '1px solid #10b981' : '1px solid #3f3f46',
                background: todo.completada ? '#10b981' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                marginTop: '1px',
                transition: 'all var(--transition-fast)'
              }}
            >
              {todo.completada && <Check size={13} color="#ffffff" strokeWidth={3} />}
            </button>

            {/* Title & Priority Badge */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem', flex: 1, minWidth: 0 }}>
              <span className="todo-item-title-text" style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: todo.completada ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: todo.completada ? 'line-through' : 'none',
                lineHeight: 1.35,
                wordBreak: 'break-word'
              }}>
                {todo.titulo}
              </span>

              {/* Priority badge pill */}
              <span className={`badge-priority badge-${todo.prioridad}`} style={{ flexShrink: 0 }}>
                {todo.prioridad}
              </span>
            </div>
          </div>

          {/* Right Meta & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
            {/* Created date (hidden on very small screens or compact) */}
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', flexShrink: 0 }}>
              {formatDate(todo.creado_en)}
            </span>

            {/* Action Buttons */}
            <div className="todo-item-actions-group">
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-ghost"
                style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
                title="Editar tarea"
              >
                <Edit2 size={14} />
              </button>

              <button
                onClick={handleDelete}
                className="btn btn-danger-ghost"
                style={{ padding: '0.4rem' }}
                title="Eliminar tarea"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Inline Edit Form */
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <input
            type="text"
            className="input-field"
            value={editTitulo}
            maxLength={255}
            onChange={(e) => setEditTitulo(e.target.value)}
            placeholder="Título..."
            autoFocus
          />

          <textarea
            className="input-field"
            rows={2}
            maxLength={2000}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Descripción (opcional)..."
            style={{ resize: 'vertical', fontSize: '0.825rem' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {(['baja', 'media', 'alta'] as NivelPrioridad[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setEditPrioridad(p)}
                  className={`badge-priority badge-${p}`}
                  style={{
                    cursor: 'pointer',
                    border: editPrioridad === p ? '1px solid currentColor' : '1px solid transparent',
                    opacity: editPrioridad === p ? 1 : 0.45,
                    textTransform: 'capitalize',
                    padding: '0.2rem 0.5rem'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
              >
                <X size={13} />
                <span>Cancelar</span>
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="btn btn-primary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                <Save size={13} />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Description Preview if present */}
      {!isEditing && todo.descripcion && (
        <div style={{
          fontSize: '0.8rem',
          color: todo.completada ? 'var(--text-tertiary)' : 'var(--text-secondary)',
          paddingLeft: '2.1rem',
          lineHeight: 1.4,
          wordBreak: 'break-word'
        }}>
          {todo.descripcion}
        </div>
      )}
    </div>
  );
};
