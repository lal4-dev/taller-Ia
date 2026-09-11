'use client';

/**
 * ==============================================================================
 * COMPONENTE: BARRA DE FILTROS Y BÚSQUEDA (TodoFilterBar)
 * ==============================================================================
 * Ofrece controles interactivos para segmentar la lista de tareas:
 * 1. Pestañas de estado: "Todas", "Pendientes", "Completadas".
 * 2. Campo de búsqueda en texto por título/descripción.
 * 3. Selector de filtro por nivel de prioridad.
 */

import React from 'react';
import { Search, CheckCircle2, Clock, ListFilter } from 'lucide-react';
import { TodoFilter, TodoFilterStatus, PriorityLevel } from '@/types/todo';

interface TodoFilterBarProps {
  /** Estado actual de los filtros aplicados */
  filter: TodoFilter;
  /** Función callback para notificar al componente padre de cualquier cambio en los filtros */
  onFilterChange: (newFilter: TodoFilter) => void;
}

export const TodoFilterBar: React.FC<TodoFilterBarProps> = ({ filter, onFilterChange }) => {
  // Manejador para el cambio de pestaña de estado
  const handleStatusChange = (status: TodoFilterStatus) => {
    onFilterChange({ ...filter, status });
  };

  // Manejador para el campo de búsqueda en vivo
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, searchQuery: e.target.value });
  };

  // Manejador para el selector de nivel de prioridad
  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, priority: e.target.value as PriorityLevel | 'all' });
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    }}>
      {/* Grupo de Pestañas Segmentadas (Todas, Pendientes, Completadas) */}
      <div style={{
        display: 'flex',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '0.3rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        gap: '0.25rem'
      }}>
        {/* Botón: Todas */}
        <button
          type="button"
          onClick={() => handleStatusChange('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            background: filter.status === 'all' ? 'var(--accent-primary)' : 'transparent',
            color: filter.status === 'all' ? '#ffffff' : 'var(--text-secondary)',
          }}
        >
          <ListFilter size={15} />
          <span>Todas</span>
        </button>

        {/* Botón: Pendientes */}
        <button
          type="button"
          onClick={() => handleStatusChange('pending')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            background: filter.status === 'pending' ? 'var(--accent-primary)' : 'transparent',
            color: filter.status === 'pending' ? '#ffffff' : 'var(--text-secondary)',
          }}
        >
          <Clock size={15} />
          <span>Pendientes</span>
        </button>

        {/* Botón: Completadas */}
        <button
          type="button"
          onClick={() => handleStatusChange('completed')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            background: filter.status === 'completed' ? 'var(--accent-primary)' : 'transparent',
            color: filter.status === 'completed' ? '#ffffff' : 'var(--text-secondary)',
          }}
        >
          <CheckCircle2 size={15} />
          <span>Completadas</span>
        </button>
      </div>

      {/* Controles de Búsqueda y Selector de Prioridad */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: '1', maxWidth: '420px' }}>
        {/* Campo de búsqueda con icono */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar tareas..."
            value={filter.searchQuery || ''}
            onChange={handleSearchChange}
            style={{
              paddingLeft: '2.5rem',
              paddingTop: '0.45rem',
              paddingBottom: '0.45rem',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Menú desplegable para filtrar por prioridad */}
        <select
          className="select-field"
          value={filter.priority || 'all'}
          onChange={handlePriorityChange}
          style={{
            width: 'auto',
            paddingTop: '0.45rem',
            paddingBottom: '0.45rem',
            fontSize: '0.85rem'
          }}
        >
          <option value="all">Todas las prioridades</option>
          <option value="high">🔴 Alta</option>
          <option value="medium">🟡 Media</option>
          <option value="low">🟢 Baja</option>
        </select>
      </div>
    </div>
  );
};
