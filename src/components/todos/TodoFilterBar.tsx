'use client';

/**
 * ==============================================================================
 * COMPONENTE: BARRA DE FILTROS Y BÚSQUEDA (TodoFilterBar)
 * ==============================================================================
 */

import React from 'react';
import { Search, CheckCircle2, Clock, ListFilter } from 'lucide-react';
import { FiltroTareas, EstadoFiltroTarea, NivelPrioridad } from '@/types/todo';

interface TodoFilterBarProps {
  filter: FiltroTareas;
  onFilterChange: (newFilter: FiltroTareas) => void;
}

export const TodoFilterBar: React.FC<TodoFilterBarProps> = ({ filter, onFilterChange }) => {
  const handleStatusChange = (estado: EstadoFiltroTarea) => {
    onFilterChange({ ...filter, estado });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, busqueda: e.target.value });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, prioridad: e.target.value as NivelPrioridad | 'todas' });
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
      {/* Pestañas Segmentadas */}
      <div style={{
        display: 'flex',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '0.3rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        gap: '0.25rem'
      }}>
        <button
          type="button"
          onClick={() => handleStatusChange('todas')}
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
            background: filter.estado === 'todas' ? 'var(--accent-primary)' : 'transparent',
            color: filter.estado === 'todas' ? '#ffffff' : 'var(--text-secondary)',
          }}
        >
          <ListFilter size={15} />
          <span>Todas</span>
        </button>

        <button
          type="button"
          onClick={() => handleStatusChange('pendientes')}
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
            background: filter.estado === 'pendientes' ? 'var(--accent-primary)' : 'transparent',
            color: filter.estado === 'pendientes' ? '#ffffff' : 'var(--text-secondary)',
          }}
        >
          <Clock size={15} />
          <span>Pendientes</span>
        </button>

        <button
          type="button"
          onClick={() => handleStatusChange('completadas')}
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
            background: filter.estado === 'completadas' ? 'var(--accent-primary)' : 'transparent',
            color: filter.estado === 'completadas' ? '#ffffff' : 'var(--text-secondary)',
          }}
        >
          <CheckCircle2 size={15} />
          <span>Completadas</span>
        </button>
      </div>

      {/* Búsqueda y Selector de Prioridad */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: '1', maxWidth: '420px' }}>
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
            value={filter.busqueda || ''}
            onChange={handleSearchChange}
            style={{
              paddingLeft: '2.5rem',
              paddingTop: '0.45rem',
              paddingBottom: '0.45rem',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <select
          className="select-field"
          value={filter.prioridad || 'todas'}
          onChange={handlePriorityChange}
          style={{
            width: 'auto',
            paddingTop: '0.45rem',
            paddingBottom: '0.45rem',
            fontSize: '0.85rem'
          }}
        >
          <option value="todas">Todas las prioridades</option>
          <option value="alta">🔴 Alta</option>
          <option value="media">🟡 Media</option>
          <option value="baja">🟢 Baja</option>
        </select>
      </div>
    </div>
  );
};
