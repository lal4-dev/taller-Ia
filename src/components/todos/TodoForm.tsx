'use client';

/**
 * ==============================================================================
 * COMPONENTE: FORMULARIO DE TAREAS (TodoForm)
 * ==============================================================================
 * Captura rápida estilo Linear: limpio, teclado amigable y validado.
 */

import React, { useState } from 'react';
import { Plus, CornerDownLeft, AlignLeft, X } from 'lucide-react';
import { CrearTareaDTO, NivelPrioridad } from '@/types/todo';

interface TodoFormProps {
  onAddTodo: (dto: CrearTareaDTO) => Promise<void>;
}

export const TodoForm: React.FC<TodoFormProps> = ({ onAddTodo }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<NivelPrioridad>('media');
  const [isOpenDetails, setIsOpenDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddTodo({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        prioridad,
      });

      setTitulo('');
      setDescripcion('');
      setPrioridad('media');
      setIsOpenDetails(false);
    } catch (error) {
      console.error('Error al enviar tarea:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pro-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.75rem' }}>
      <form onSubmit={handleSubmit}>
        {/* Main Input Row */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="input-field"
              placeholder="Añadir una nueva tarea..."
              value={titulo}
              maxLength={255}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={isSubmitting}
              required
              style={{
                fontSize: '0.9rem',
                padding: '0.65rem 0.85rem',
                border: '1px solid var(--border-subtle)'
              }}
            />
          </div>

          {/* Toggle details button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsOpenDetails(!isOpenDetails)}
            style={{
              padding: '0.6rem 0.75rem',
              color: isOpenDetails ? 'var(--text-primary)' : 'var(--text-muted)',
              borderColor: isOpenDetails ? 'var(--border-muted)' : 'var(--border-subtle)'
            }}
            title="Añadir notas o cambiar prioridad"
          >
            <AlignLeft size={15} />
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!titulo.trim() || isSubmitting}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1rem' }}
          >
            <Plus size={15} />
            <span>Crear</span>
            <span className="key-badge" style={{ marginLeft: '4px', opacity: 0.6 }}>↵</span>
          </button>
        </div>

        {/* Collapsible Details */}
        {isOpenDetails && (
          <div className="animate-fade-in" style={{
            marginTop: '0.85rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '0.85rem',
            alignItems: 'start'
          }}>
            {/* Description */}
            <div>
              <textarea
                className="input-field"
                rows={2}
                maxLength={2000}
                placeholder="Descripción o notas de contexto (opcional)..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                style={{ resize: 'vertical', fontSize: '0.825rem' }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>
                {descripcion.length}/2000
              </div>
            </div>

            {/* Priority Selector Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Prioridad
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {(['baja', 'media', 'alta'] as NivelPrioridad[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrioridad(p)}
                    className={`badge-priority badge-${p}`}
                    style={{
                      cursor: 'pointer',
                      border: prioridad === p ? '1px solid currentColor' : '1px solid transparent',
                      opacity: prioridad === p ? 1 : 0.5,
                      textTransform: 'capitalize',
                      padding: '0.3rem 0.6rem'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
