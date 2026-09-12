'use client';

/**
 * ==============================================================================
 * PÁGINA PRINCIPAL / ENRUTADOR RAÍZ (HomePage)
 * ==============================================================================
 * - Si el usuario ya tiene sesión activa -> Redirige a `/dashboard`.
 * - Si no está autenticado -> Redirige a `/login`.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const verificarAutenticacion = async () => {
      try {
        const usuario = await authService.getCurrentUser();
        if (usuario) {
          router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
      } catch {
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
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: '2px solid var(--border-subtle)',
          borderTopColor: 'var(--text-primary)',
          animation: 'spin 0.6s linear infinite'
        }}
      />
    </div>
  );
}
