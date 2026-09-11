'use client';

import React, { useState } from 'react';
import { Plus, Tag, AlignLeft, Sparkles, Loader2 } from 'lucide-react';
import { CreateTodoDTO, PriorityLevel } from '@/types/todo';

interface TodoFormProps {
  onAddTodo: (dto: CreateTodoDTO) => Promise<void>;
}

export const TodoForm: React.FC<TodoFormProps> = ({ onAddTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [isOpenDetails, setIsOpenDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddTodo({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
      });

      setTitle('');
      setDescription('');
      setPriority('medium');
      setIsOpenDetails(false);
    } catch (error) {
      console.error('Error al enviar tarea:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <form onSubmit={handleSubmit}>
        {/* Main Input Line */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="input-field"
              placeholder="¿Qué necesitas lograr hoy? Escribe una nueva tarea..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              required
              style={{
                fontSize: '1rem',
                padding: '0.85rem 1.25rem',
              }}
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsOpenDetails(!isOpenDetails)}
            title="Opciones adicionales (Descripción y Prioridad)"
            style={{
              padding: '0.85rem 1rem',
              borderColor: isOpenDetails ? 'var(--accent-primary)' : undefined,
              color: isOpenDetails ? 'var(--accent-primary)' : undefined,
            }}
          >
            <AlignLeft size={18} />
          </button>

          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.5rem', minWidth: '130px' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>

        {/* Collapsible Details (Description & Priority) */}
        {isOpenDetails && (
          <div className="animate-fade-in" style={{
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '1rem'
          }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlignLeft size={14} />
                <span>Descripción o notas adicionales (Opcional)</span>
              </label>
              <textarea
                className="input-field"
                rows={2}
                placeholder="Añade detalles, pasos o contexto de la tarea..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Tag size={14} />
                <span>Prioridad</span>
              </label>
              <select
                className="select-field"
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              >
                <option value="low">🟢 Baja (Low)</option>
                <option value="medium">🟡 Media (Medium)</option>
                <option value="high">🔴 Alta (High)</option>
              </select>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
