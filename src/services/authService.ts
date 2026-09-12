/**
 * ==============================================================================
 * CAPA DE SERVICIOS: AUTENTICACIÓN (authService)
 * ==============================================================================
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: string;
  errorType?: 'user_not_found' | 'user_already_exists' | 'invalid_password' | 'general';
}

export const authService = {
  /**
   * Registra un nuevo usuario en Supabase Auth.
   */
  async signUp(email: string, password: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) {
      return {
        user: null,
        session: null,
        error: 'Las credenciales de Supabase no están configuradas en Vercel/entorno. Por favor añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel > Settings > Environment Variables.',
        errorType: 'general'
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: this.formatAuthError(error),
          errorType: error.message.toLowerCase().includes('already') ? 'user_already_exists' : 'general'
        };
      }

      // Si Supabase devuelve un usuario sin identidades (en algunos casos donde ya existe)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return {
          user: null,
          session: null,
          error: 'Este correo ya está registrado. Por favor, cambia a la pestaña "Iniciar Sesión".',
          errorType: 'user_already_exists'
        };
      }

      return { user: data.user, session: data.session };
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error inesperado al registrar el usuario.';
      return { user: null, session: null, error: mensaje, errorType: 'general' };
    }
  },

  /**
   * Inicia sesión con credenciales existentes.
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) {
      return {
        user: null,
        session: null,
        error: 'Las credenciales de Supabase no están configuradas en Vercel/entorno. Añade las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.',
        errorType: 'general'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: this.formatAuthError(error),
          errorType: error.message.toLowerCase().includes('invalid') ? 'invalid_password' : 'general'
        };
      }

      return { user: data.user, session: data.session };
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error al iniciar sesión.';
      return { user: null, session: null, error: mensaje, errorType: 'general' };
    }
  },

  /**
   * Cierra la sesión activa del usuario.
   */
  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error al cerrar sesión.';
      return { error: mensaje };
    }
  },

  /**
   * Obtiene la información del usuario autenticado actualmente.
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Obtiene la sesión activa.
   */
  async getSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch {
      return null;
    }
  },

  /**
   * Traduce errores técnicos de Supabase a explicaciones claras en español.
   */
  formatAuthError(error: AuthError): string {
    const msg = error.message.toLowerCase();
    if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
      return 'El correo o la contraseña son incorrectos. Si no tienes una cuenta todavía, regístrate en la pestaña "Crear Cuenta".';
    }
    if (msg.includes('user already registered') || msg.includes('already exists') || msg.includes('already been registered')) {
      return 'Este correo ya tiene una cuenta creada. Por favor, selecciona "Iniciar Sesión" con tu contraseña.';
    }
    if (msg.includes('password should be at least')) {
      return 'La contraseña debe tener un mínimo de 6 caracteres.';
    }
    if (msg.includes('signup requires a valid password')) {
      return 'Por favor, ingresa una contraseña válida de al menos 6 caracteres.';
    }
    if (msg.includes('email not confirmed')) {
      return 'Tu correo no ha sido confirmado aún. Revisa tu bandeja de entrada o desactiva "Confirm email" en Supabase.';
    }
    if (msg.includes('rate limit') || msg.includes('too many requests')) {
      return 'Demasiados intentos seguidos. Por favor espera un momento e inténtalo de nuevo.';
    }
    return error.message;
  },
};
