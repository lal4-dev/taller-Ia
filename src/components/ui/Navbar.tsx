'use client';

/**
 * ==============================================================================
 * COMPONENTE: BARRA DE NAVEGACIÓN (Navbar)
 * ==============================================================================
 * Diseño profesional minimalista: limpio, sobrio y funcional.
 */

import React from 'react';
import { LogOut, Database, Cloud } from 'lucide-react';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  userEmail?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ userEmail }) => {
  const router = useRouter();
  const isConnected = isSupabaseConfigured();

  const handleSignOut = async () => {
    await authService.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="navbar-header">
      {/* Brand & Workspace Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: 'var(--radius-sm)',
          background: '#fafafa',
          color: '#09090b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.85rem',
          letterSpacing: '-0.04em',
          flexShrink: 0
        }}>
          T
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            TaskPulse
          </span>
          <span className="navbar-brand-subtitle">
            Workspace
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Status Indicator */}
        <div
          title={isConnected ? 'Conexión activa con Supabase Cloud' : 'Modo local sin conexión remota'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            background: isConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: isConnected ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)',
            fontSize: '0.725rem',
            fontWeight: 500,
            color: isConnected ? '#34d399' : '#fbbf24',
            whiteSpace: 'nowrap'
          }}
        >
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#f59e0b',
            flexShrink: 0
          }} />
          <span>{isConnected ? 'Supabase' : 'Local'}</span>
        </div>

        {/* User profile & Logout */}
        {userEmail && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div className="navbar-user-badge">
              <span style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#27272a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                color: '#fafafa',
                fontWeight: 600,
                textTransform: 'uppercase',
                flexShrink: 0
              }}>
                {userEmail.charAt(0)}
              </span>
              <span className="navbar-user-text">
                {userEmail}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="btn btn-ghost"
              style={{ padding: '0.35rem 0.55rem', fontSize: '0.775rem' }}
              title="Cerrar sesión"
            >
              <LogOut size={14} />
              <span className="navbar-logout-text">Salir</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
