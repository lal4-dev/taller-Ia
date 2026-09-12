import React from 'react';
import { EstadisticasTareas } from '@/types/todo';

/**
 * ==============================================================================
 * COMPONENTE: RESUMEN DE MÉTRICAS (TodoStatsCards)
 * ==============================================================================
 * Barra de KPIs ejecutiva, limpia y sin colores estridentes.
 */

interface TodoStatsCardsProps {
  stats: EstadisticasTareas;
}

export const TodoStatsCards: React.FC<TodoStatsCardsProps> = ({ stats }) => {
  return (
    <div className="pro-card" style={{
      padding: '1.25rem 1.5rem',
      marginBottom: '1.75rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1.5rem',
      alignItems: 'center'
    }}>
      {/* 1. Total */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Total
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
          {stats.total}
        </div>
      </div>

      {/* 2. Pendientes */}
      <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Pendientes
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
          {stats.pendientes}
        </div>
      </div>

      {/* 3. Completadas */}
      <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Completadas
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
          {stats.completadas}
        </div>
      </div>

      {/* 4. Avance General */}
      <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Avance
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {stats.tasaProgreso}%
          </div>
        </div>
        <div style={{
          width: '100%',
          height: '4px',
          background: 'var(--bg-surface-raised)',
          borderRadius: '999px',
          marginTop: '0.65rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${stats.tasaProgreso}%`,
            height: '100%',
            background: stats.tasaProgreso === 100 ? '#10b981' : '#fafafa',
            borderRadius: '999px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
    </div>
  );
};
