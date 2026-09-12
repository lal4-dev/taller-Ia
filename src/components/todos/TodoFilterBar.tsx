'use client';

/**
 * ==============================================================================
 * COMPONENTE: BARRA DE FILTROS (TodoFilterBar)
 * ==============================================================================
 * Control segmentado tipo Linear con búsqueda instantánea y filtros discretos.
 */

import React from 'react';
import { Search, X } from 'lucide-react';
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
      gap: '0.75rem',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.25rem'
    }}>
      {/* Segmented Control */}
      <div style={{
        display: 'inline-flex',
        background: 'var(--bg-surface)',
        padding: '0.2rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        gap: '0.15rem'
      }}>
        {(['todas', 'pendientes', 'completadas'] as EstadoFiltroTarea[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleStatusChange(tab)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              background: filter.estado === tab ? 'var(--bg-surface-raised)' : 'transparent',
              color: filter.estado === tab ? '#fafafa' : 'var(--text-muted)',
              borderBottom: filter.estado === tab ? '1px solid var(--border-muted)' : '1px solid transparent',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search & Priority Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1, maxWidth: '380px' }}>
        {/* Search input with clean clear button */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={14}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar..."
            value={filter.busqueda || ''}
            onChange={handleSearchChange}
            style={{
              paddingLeft: '2rem',
              paddingRight: filter.busqueda ? '2rem' : '0.75rem',
              paddingTop: '0.4rem',
              paddingBottom: '0.4rem',
              fontSize: '0.8rem'
            }}
          />
          {filter.busqueda && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filter, busqueda: '' })}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <select
          className="select-field"
          value={filter.prioridad || 'todas'}
          onChange={handlePriorityChange}
          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
        >
          <option value="todas">Prioridad: Todas</option>
          <option value="alta">🔴 Alta</option>
          <option value="media">🟡 Media</option>
          <option value="baja">⚪ Baja</option>
        </select>
      </div>
    </div>
  );
};
