'use client';

/**
 * ==============================================================================
 * COMPONENTE: FORMULARIO DE AUTENTICACIÓN (AuthForm)
 * ==============================================================================
 * Proporciona una interfaz unificada para:
 * 1. Iniciar Sesión (Login) con correo y contraseña.
 * 2. Registrarse (Sign Up) como nuevo usuario.
 * 
 * Incluye:
 * - Validación de campos en tiempo real (longitud de contraseña, formato de email).
 * - Notificaciones visuales de error amigables.
 * - Modo demostración automático si aún no se configuran claves de Supabase.
 */

import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, UserPlus, LogIn, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const AuthForm: React.FC = () => {
  const router = useRouter();
  
  // Alterna entre modo Registro (true) y modo Inicio de Sesión (false)
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Valores controlados de los campos
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Mensajes de alerta en pantalla
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  
  // Estado de carga durante peticiones a Supabase
  const [isLoading, setIsLoading] = useState(false);

  const isConfigured = isSupabaseConfigured();

  /**
   * Maneja el envío del formulario de autenticación
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    // En modo demo sin claves de Supabase, simulamos un inicio de sesión directo
    if (!isConfigured) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        router.push('/dashboard');
      }, 600);
      return;
    }

    // Validaciones de seguridad en cliente
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
        // Flujo de Registro
        const res = await authService.signUp(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setInfoMsg('¡Cuenta creada con éxito! Si tienes confirmación de correo activa en Supabase, revisa tu bandeja de entrada o inicia sesión directamente.');
          if (res.session) {
            router.push('/dashboard');
          }
        }
      } else {
        // Flujo de Inicio de Sesión
        const res = await authService.signIn(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error en la autenticación';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '2.5rem 2rem' }}>
      {/* Cabecera de la Tarjeta */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'var(--grad-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
          }}
        >
          {isSignUp ? <UserPlus size={26} color="#fff" /> : <LogIn size={26} color="#fff" />}
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          {isSignUp ? 'Crear una cuenta' : 'Bienvenido de nuevo'}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isSignUp
            ? 'Ingresa tus datos para comenzar a organizar tus tareas'
            : 'Ingresa a tu cuenta para gestionar tus tareas sincronizadas'}
        </p>
      </div>

      {/* Banner de ayuda si no se han configurado las claves de Supabase */}
      {!isConfigured && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#fbbf24',
            fontSize: '0.825rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem'
          }}
        >
          <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Modo Demostración Activo:</strong> Puedes ingresar directamente sin credenciales o configurar tu archivo <code>.env.local</code> con Supabase para datos en la nube.
          </div>
        </div>
      )}

      {/* Alerta de Error */}
      {errorMsg && (
        <div
          className="animate-fade-in"
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Alerta de Información / Éxito */}
      {infoMsg && (
        <div
          className="animate-fade-in"
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem'
          }}
        >
          <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{infoMsg}</span>
        </div>
      )}

      {/* Formulario con campos de Email y Contraseña */}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Mail size={14} /> Correo Electrónico
          </label>
          <input
            type="email"
            className="input-field"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={isConfigured}
          />
        </div>

        <div className="input-group" style={{ marginBottom: '1.75rem' }}>
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lock size={14} /> Contraseña
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
          style={{ width: '100%', padding: '0.9rem' }}
        >
          <span>{isLoading ? 'Procesando...' : isSignUp ? 'Registrarme' : 'Iniciar Sesión'}</span>
          <ArrowRight size={18} />
        </button>
      </form>

      {/* Alternador entre Registrarse e Iniciar Sesión */}
      <div style={{
        marginTop: '1.75rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-subtle)',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)'
      }}>
        {isSignUp ? '¿Ya tienes una cuenta registrada?' : '¿Aún no tienes una cuenta?'}{' '}
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
            color: 'var(--accent-primary)',
            fontWeight: 700,
            cursor: 'pointer',
            marginLeft: '4px',
            textDecoration: 'underline'
          }}
        >
          {isSignUp ? 'Inicia sesión aquí' : 'Crea una cuenta gratis'}
        </button>
      </div>
    </div>
  );
};
