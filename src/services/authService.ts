/**
 * ==============================================================================
 * CAPA DE SERVICIOS: AUTENTICACIÓN (authService)
 * ==============================================================================
 * Este servicio encapsula todas las operaciones relacionadas con la identidad
 * y sesiones de usuarios en Supabase Auth (GoTrue).
 * 
 * Ventaja arquitectónica: La interfaz de usuario nunca llama directamente a la API
 * de autenticación; todo pasa por este servicio, lo que permite normalizar respuestas,
 * capturar errores y traducir los mensajes técnicos de Supabase a un español comprensible.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * Estructura de respuesta estandarizada para operaciones de autenticación.
 */
export interface AuthResponse {
  /** Objeto del usuario autenticado (contiene id, email, metadatos) */
  user: User | null;
  /** Sesión activa que contiene el token JWT de acceso */
  session: Session | null;
  /** Mensaje de error formateado en caso de fallar */
  error?: string;
}

export const authService = {
  /**
   * Registra un nuevo usuario en Supabase Auth mediante correo electrónico y contraseña.
   * 
   * @param {string} email - Correo del nuevo usuario.
   * @param {string} password - Contraseña (mínimo 6 caracteres).
   * @returns {Promise<AuthResponse>} Objeto con el usuario, sesión o mensaje de error.
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
      const mensaje = err instanceof Error ? err.message : 'Error inesperado al registrar el usuario.';
      return { user: null, session: null, error: mensaje };
    }
  },

  /**
   * Inicia sesión con credenciales existentes (Email y Contraseña).
   * Si las credenciales son válidas, Supabase guarda el JWT en el almacenamiento local.
   * 
   * @param {string} email - Correo registrado.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<AuthResponse>} Objeto con los datos de sesión o mensaje de error.
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
      const mensaje = err instanceof Error ? err.message : 'Error inesperado al iniciar sesión.';
      return { user: null, session: null, error: mensaje };
    }
  },

  /**
   * Cierra la sesión activa del usuario actual y elimina los tokens almacenados.
   * 
   * @returns {Promise<{ error?: string }>} Objeto vacío si el cierre fue exitoso o con el error.
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
      const mensaje = err instanceof Error ? err.message : 'Error al cerrar sesión.';
      return { error: mensaje };
    }
  },

  /**
   * Obtiene la información del usuario autenticado actualmente desde la sesión de Supabase.
   * 
   * @returns {Promise<User | null>} El usuario actual o null si no hay sesión activa.
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
   * Obtiene la sesión completa (incluyendo tokens de acceso y expiración).
   * 
   * @returns {Promise<Session | null>} Objeto de sesión o null.
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
   * Función auxiliar que traduce los mensajes técnicos en inglés de Supabase
   * a explicaciones claras y amigables en español para el usuario final.
   * 
   * @param {AuthError} error - Error original devuelto por el SDK de Supabase.
   * @returns {string} Mensaje traducido y formateado en español.
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
