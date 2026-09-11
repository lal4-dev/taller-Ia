/**
 * ==============================================================================
 * CLIENTE DE INFRAESTRUCTURA: SUPABASE (SINGLETON)
 * ==============================================================================
 * Este archivo centraliza la inicialización del cliente de Supabase para el navegador.
 * 
 * Sigue el patrón de diseño Singleton: crea una única instancia del cliente
 * reutilizable en toda la aplicación, manejando la persistencia de la sesión (JWT)
 * y la detección automática de variables de entorno configuradas.
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Lectura de variables de entorno públicas desde .env.local
const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const claveAnonSupabase = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Función que verifica si el usuario ya configuró sus credenciales reales de Supabase.
 * Devuelve false si las variables están vacías o contienen los textos por defecto (placeholders).
 * 
 * @returns {boolean} True si las credenciales son válidas y están configuradas.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(urlSupabase) &&
    Boolean(claveAnonSupabase) &&
    !urlSupabase.includes('your-project') &&
    !claveAnonSupabase.includes('your-anon')
  );
};

/**
 * Instancia global tipada del cliente de Supabase para el navegador.
 * - persistSession: Mantiene al usuario conectado guardando el token JWT en el LocalStorage/Cookies.
 * - autoRefreshToken: Renueva automáticamente el token antes de que expire.
 * - detectSessionInUrl: Detecta tokens provenientes de enlaces de confirmación por email.
 */
export const supabase = createClient<Database>(
  urlSupabase || 'https://placeholder.supabase.co',
  claveAnonSupabase || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
