'use client';

/**
 * ==============================================================================
 * PÁGINA PRINCIPAL / ENRUTADOR RAÍZ (HomePage)
 * ==============================================================================
 * Actúa como una compuerta de redirección inteligente:
 * - Si el usuario ya tiene una sesión activa en Supabase -> Redirige a `/dashboard`.
 * - Si no está autenticado -> Redirige a `/login`.
 * - Si está en modo demo local -> Redirige directamente al `/dashboard`.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const verificarAutenticacion = async () => {
      // En modo local sin credenciales, enviamos al dashboard directamente
      if (!isSupabaseConfigured()) {
        router.replace('/dashboard');
        return;
      }

      // Verificamos si existe usuario autenticado
      const usuario = await authService.getCurrentUser();
      if (usuario) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    };

    verificarAutenticacion();
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      {/* Indicador de carga animado mientras se evalúa la sesión */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: 'var(--accent-primary)',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cargando TaskPulse...</p>
    </div>
  );
}
