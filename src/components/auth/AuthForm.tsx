'use client';

/**
 * ==============================================================================
 * COMPONENTE: FORMULARIO DE ACCESO (AuthForm)
 * ==============================================================================
 * Estilo Vercel / Supabase: sobrio, monocromático, tipografía limpia y sin distracciones.
 */

import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AuthForm: React.FC = () => {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!isConfigured) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        router.push('/dashboard');
      }, 500);
      return;
    }

    if (!email || !password) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      if (isSignUp) {
        const res = await authService.signUp(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setInfoMsg('Cuenta creada correctamente. Iniciando sesión...');
          if (res.session) {
            router.push('/dashboard');
          }
        }
      } else {
        const res = await authService.signIn(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error de autenticación';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pro-card animate-fade-in" style={{ padding: '2rem 1.75rem' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: '#fafafa',
            color: '#09090b',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1rem',
            marginBottom: '0.85rem'
          }}
        >
          T
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {isSignUp ? 'Crear cuenta en TaskPulse' : 'Iniciar sesión en TaskPulse'}
        </h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {isSignUp
            ? 'Ingresa tus datos para registrar tu espacio de trabajo'
            : 'Accede con tus credenciales de Supabase'}
        </p>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div
          className="animate-fade-in"
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {infoMsg && (
        <div
          className="animate-fade-in"
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#34d399',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
          <span>{infoMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Correo electrónico
          </label>
          <input
            type="email"
            className="input-field"
            placeholder="nombre@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={isConfigured}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Contraseña
          </label>
          <input
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={isConfigured}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem' }}
        >
          <span>{isLoading ? 'Procesando...' : isSignUp ? 'Registrarse' : 'Continuar'}</span>
          <ArrowRight size={14} />
        </button>
      </form>

      {/* Switch Form */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta todavía?'}{' '}
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMsg(null);
            setInfoMsg(null);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: '3px',
            textDecoration: 'underline'
          }}
        >
          {isSignUp ? 'Inicia sesión' : 'Regístrate'}
        </button>
      </div>
    </div>
  );
};
