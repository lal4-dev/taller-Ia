import React from 'react';
import { TodoStats } from '@/types/todo';
import { ListTodo, CheckCircle, Clock, TrendingUp } from 'lucide-react';

/**
 * ==============================================================================
 * COMPONENTE: TARJETAS DE ESTADÍSTICAS Y MÉTRICAS (TodoStatsCards)
 * ==============================================================================
 * Renderiza 4 tarjetas visuales con diseño glassmorphism para resumir el estado
 * actual de productividad del usuario:
 * 1. Total de Tareas.
 * 2. Tareas Pendientes (amarillo).
 * 3. Tareas Completadas (verde).
 * 4. Porcentaje de Progreso con barra de avance animada.
 */

interface TodoStatsCardsProps {
  /** Objeto con las métricas agregadas calculadas */
  stats: TodoStats;
}

export const TodoStatsCards: React.FC<TodoStatsCardsProps> = ({ stats }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      {/* Tarjeta 1: Total de Tareas */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          <ListTodo size={22} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Tareas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.total}</div>
        </div>
      </div>

      {/* Tarjeta 2: Tareas Pendientes */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(245, 158, 11, 0.15)',
          color: 'var(--accent-warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          <Clock size={22} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Pendientes</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-warning)' }}>{stats.pending}</div>
        </div>
      </div>

      {/* Tarjeta 3: Tareas Completadas */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.15)',
          color: 'var(--accent-success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <CheckCircle size={22} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Completadas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-success)' }}>{stats.completed}</div>
        </div>
      </div>

      {/* Tarjeta 4: Tasa de Progreso General */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(236, 72, 153, 0.15)',
          color: 'var(--accent-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(236, 72, 153, 0.3)'
        }}>
          <TrendingUp size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Progreso</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.completionRate}%</div>
          {/* Barra de progreso visual con gradiente */}
          <div style={{
            width: '100%',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '999px',
            marginTop: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${stats.completionRate}%`,
              height: '100%',
              background: 'var(--grad-primary)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};
