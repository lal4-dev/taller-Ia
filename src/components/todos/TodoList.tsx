'use client';

/**
 * ==============================================================================
 * COMPONENTE: CONTENEDOR DE LISTA DE TAREAS (TodoList)
 * ==============================================================================
 * Gestiona los diferentes estados visuales de la colección de tareas:
 * 1. Estado de carga: muestra esqueletos pulsantes (Skeleton Loaders).
 * 2. Estado vacío: ilustración y mensaje de bienvenida cuando no hay tareas coincidentes.
 * 3. Lista activa: mapeo iterativo de cada elemento con el componente `TodoItem`.
 */

import React from 'react';
import { Todo, UpdateTodoDTO } from '@/types/todo';
import { TodoItem } from './TodoItem';
import { Sparkles } from 'lucide-react';

interface TodoListProps {
  /** Arreglo de tareas a listar */
  todos: Todo[];
  /** Booleano que indica si se están cargando los datos desde Supabase */
  isLoading: boolean;
  /** Función para alternar estado de una tarea */
  onToggle: (id: string, is_completed: boolean) => Promise<void>;
  /** Función para eliminar una tarea */
  onDelete: (id: string) => Promise<void>;
  /** Función para actualizar el contenido de una tarea */
  onUpdate: (id: string, updates: UpdateTodoDTO) => Promise<void>;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  isLoading,
  onToggle,
  onDelete,
  onUpdate,
}) => {
  // 1. Estado de Carga (Skeleton Skeletons)
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="glass-card"
            style={{
              height: '75px',
              animation: 'pulse 1.5s ease-in-out infinite',
              opacity: 0.5,
            }}
          />
        ))}
      </div>
    );
  }

  // 2. Estado Vacío (Empty State)
  if (todos.length === 0) {
    return (
      <div
        className="glass-card"
        style={{
          padding: '3.5rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
          }}
        >
          <Sparkles size={28} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>No hay tareas aquí</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '340px' }}>
            Todo está al día o no coincide con los filtros seleccionados. ¡Crea una nueva tarea arriba para empezar!
          </p>
        </div>
      </div>
    );
  }

  // 3. Renderizado de la lista de tareas
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
