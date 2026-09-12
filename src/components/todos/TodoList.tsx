'use client';

/**
 * ==============================================================================
 * COMPONENTE: LISTA DE TAREAS (TodoList)
 * ==============================================================================
 * Renderiza la colección de tareas, esqueletos sutiles o estado vacío minimalista.
 */

import React from 'react';
import { Tarea, ActualizarTareaDTO } from '@/types/todo';
import { TodoItem } from './TodoItem';
import { CheckCircle2 } from 'lucide-react';

interface TodoListProps {
  todos: Tarea[];
  isLoading: boolean;
  onToggle: (id: string, completada: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: ActualizarTareaDTO) => Promise<void>;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  isLoading,
  onToggle,
  onDelete,
  onUpdate,
}) => {
  // Skeleton Loader sobrio
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="pro-card"
            style={{
              height: '48px',
              opacity: 0.35,
              background: 'var(--bg-surface-raised)'
            }}
          />
        ))}
      </div>
    );
  }

  // Estado vacío sobrio
  if (todos.length === 0) {
    return (
      <div
        className="pro-card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          borderStyle: 'dashed'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--bg-surface-raised)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}
        >
          <CheckCircle2 size={18} />
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            No hay tareas pendientes
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Crea una nueva tarea arriba o cambia los filtros de búsqueda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};
