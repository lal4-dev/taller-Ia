import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: string;
}

export const authService = {
  /**
   * Registra un nuevo usuario con correo y contraseña.
   */
  async signUp(email: string, password: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase no está configurado. Por favor, añade tus credenciales en el archivo .env.local');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { user: null, session: null, error: this.formatAuthError(error) };
      }

      return { user: data.user, session: data.session };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado al registrar el usuario.';
      return { user: null, session: null, error: message };
    }
  },

  /**
   * Inicia sesión con correo y contraseña.
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase no está configurado. Por favor, añade tus credenciales en el archivo .env.local');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, session: null, error: this.formatAuthError(error) };
      }

      return { user: data.user, session: data.session };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado al iniciar sesión.';
      return { user: null, session: null, error: message };
    }
  },

  /**
   * Cierra la sesión activa.
   */
  async signOut(): Promise<{ error?: string }> {
    if (!isSupabaseConfigured()) return {};

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cerrar sesión.';
      return { error: message };
    }
  },

  /**
   * Obtiene el usuario autenticado actualmente.
   */
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Obtiene la sesión actual.
   */
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch {
      return null;
    }
  },

  /**
   * Traduce y formatea errores comunes de autenticación de Supabase a español amigable.
   */
  formatAuthError(error: AuthError): string {
    const msg = error.message.toLowerCase();
    if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
      return 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.';
    }
    if (msg.includes('user already registered') || msg.includes('already exists')) {
      return 'Este correo electrónico ya está registrado. Intenta iniciar sesión.';
    }
    if (msg.includes('password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (msg.includes('signup requires a valid password')) {
      return 'Por favor, ingresa una contraseña válida.';
    }
    if (msg.includes('email not confirmed')) {
      return 'Por favor, confirma tu correo electrónico antes de ingresar (o desactiva la confirmación de email en Supabase > Auth > Providers).';
    }
    return error.message;
  },
};
