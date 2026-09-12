'use client';

/**
 * ==============================================================================
 * COMPONENTE: FORMULARIO DE ACCESO (AuthForm)
 * ==============================================================================
 * - Pestañas superiores claras (Iniciar Sesión / Crear Cuenta).
 * - Botón para ver u ocultar la contraseña (Eye / EyeOff).
 * - Mensajes de error claros y directos si la cuenta no existe o la clave es incorrecta.
 * - Sin bypass de invitados: acceso estricto y seguro.
 */

import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';

export const AuthForm: React.FC = () => {
  const router = useRouter();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [sugerenciaRegistro, setSugerenciaRegistro] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSugerenciaRegistro(false);

    if (!isConfigured) {
      setErrorMsg('Las variables de conexión de Supabase no están configuradas en el archivo .env.local o en Vercel.');
      return;
    }

    if (!email.trim() || !password) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setIsLoading(true);

      if (modoRegistro) {
        // Modo Registro
        const res = await authService.signUp(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setInfoMsg('¡Cuenta creada exitosamente! Redirigiendo a tu espacio de trabajo...');
          // Si Supabase autoconfirmó el usuario, entramos directamente
          if (res.session || res.user) {
            // Intentar inicio de sesión directo para asegurar sesión
            await authService.signIn(email, password);
            router.push('/dashboard');
          }
        }
      } else {
        // Modo Inicio de Sesión
        const res = await authService.signIn(email, password);
        if (res.error) {
          setErrorMsg(res.error);
          // Si el login falla, activar sugerencia para crear cuenta si no la tiene
          setSugerenciaRegistro(true);
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
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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
            marginBottom: '0.75rem'
          }}
        >
          T
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          TaskPulse
        </h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Gestor de tareas seguro y sincronizado
        </p>
      </div>

      {/* Tabs para alternar claramente entre Iniciar Sesión y Registrarse */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.25rem',
        background: 'var(--bg-app)',
        padding: '0.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '1.5rem'
      }}>
        <button
          type="button"
          onClick={() => {
            setModoRegistro(false);
            setErrorMsg(null);
            setInfoMsg(null);
            setSugerenciaRegistro(false);
          }}
          style={{
            padding: '0.45rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.825rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            background: !modoRegistro ? 'var(--bg-surface-raised)' : 'transparent',
            color: !modoRegistro ? '#fafafa' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem'
          }}
        >
          <LogIn size={13} />
          <span>Iniciar Sesión</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setModoRegistro(true);
            setErrorMsg(null);
            setInfoMsg(null);
            setSugerenciaRegistro(false);
          }}
          style={{
            padding: '0.45rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.825rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            background: modoRegistro ? 'var(--bg-surface-raised)' : 'transparent',
            color: modoRegistro ? '#fafafa' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem'
          }}
        >
          <UserPlus size={13} />
          <span>Crear Cuenta</span>
        </button>
      </div>

      {/* Alerta de Error */}
      {errorMsg && (
        <div
          className="animate-fade-in"
          style={{
            padding: '0.75rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            lineHeight: 1.4
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMsg}</div>
          </div>

          {sugerenciaRegistro && !modoRegistro && (
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <button
                type="button"
                onClick={() => {
                  setModoRegistro(true);
                  setErrorMsg(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                ¿Aún no tienes cuenta? Haz clic aquí para crear una nueva
              </button>
            </div>
          )}
        </div>
      )}

      {/* Alerta de Éxito / Info */}
      {infoMsg && (
        <div
          className="animate-fade-in"
          style={{
            padding: '0.75rem 0.85rem',
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

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Correo electrónico
          </label>
          <input
            type="email"
            className="input-field"
            placeholder="usuario@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Contraseña
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={mostrarPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: '2.5rem' }}
            />
            {/* Botón para ver/ocultar contraseña */}
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              style={{
                position: 'absolute',
                right: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.2rem'
              }}
              title={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {mostrarPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.65rem', marginTop: '0.4rem' }}
        >
          <span>{isLoading ? 'Comprobando...' : modoRegistro ? 'Crear mi cuenta' : 'Iniciar Sesión'}</span>
          <ArrowRight size={14} />
        </button>
      </form>
    </div>
  );
};
