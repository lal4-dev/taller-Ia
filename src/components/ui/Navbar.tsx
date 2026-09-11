'use client';

/**
 * ==============================================================================
 * COMPONENTE: BARRA DE NAVEGACIÓN SUPERIOR (Navbar)
 * ==============================================================================
 * Muestra el logotipo de la aplicación, el estado de sincronización con Supabase,
 * el correo del usuario con sesión activa y el botón para cerrar sesión.
 */

import React from 'react';
import { User, LogOut, CheckCircle2, Cloud, Database } from 'lucide-react';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  /** Correo del usuario autenticado (opcional) */
  userEmail?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ userEmail }) => {
  const router = useRouter();
  // Comprueba si la aplicación está conectada a la nube de Supabase o en modo local
  const isConnected = isSupabaseConfigured();

  /**
   * Maneja el cierre de sesión destruyendo el token y redirigiendo al login.
   */
  const handleSignOut = async () => {
    await authService.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem 2rem',
      background: 'rgba(18, 24, 38, 0.75)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Logotipo y Título de la Aplicación */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--grad-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
        }}>
          <CheckCircle2 size={24} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
            TaskPulse <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', padding: '2px 8px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '999px', border: '1px solid rgba(99, 102, 241, 0.3)', marginLeft: '6px' }}>AI Ready</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Gestor de tareas con arquitectura limpia y Supabase
          </p>
        </div>
      </div>

      {/* Controles del lado derecho: Indicador de conexión y Perfil */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Indicador de estado de Supabase */}
        <div
          title={isConnected ? 'Conectado a Supabase Cloud' : 'Modo Local (Configura .env.local para sincronizar)'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: isConnected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: isConnected ? '#34d399' : '#fbbf24'
          }}
        >
          {isConnected ? <Database size={14} /> : <Cloud size={14} />}
          <span>{isConnected ? 'Supabase Conectado' : 'Modo Demo / Local'}</span>
        </div>

        {/* Datos del usuario autenticado y botón de salida */}
        {userEmail && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              <User size={15} color="var(--accent-primary)" />
              <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="btn btn-ghost"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
