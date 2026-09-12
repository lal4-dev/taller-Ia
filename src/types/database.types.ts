/**
 * ==============================================================================
 * TIPOS GENERADOS DE LA BASE DE DATOS (SUPABASE POSTGRESQL)
 * ==============================================================================
 * Refleja el esquema 100% en español de la tabla `tareas` en Supabase.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tareas: {
        Row: {
          id: string
          usuario_id: string
          titulo: string
          descripcion: string | null
          prioridad: 'baja' | 'media' | 'alta'
          completada: boolean
          creado_en: string
          actualizado_en: string
        }
        Insert: {
          id?: string
          usuario_id?: string
          titulo: string
          descripcion?: string | null
          prioridad?: 'baja' | 'media' | 'alta'
          completada?: boolean
          creado_en?: string
          actualizado_en?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          titulo?: string
          descripcion?: string | null
          prioridad?: 'baja' | 'media' | 'alta'
          completada?: boolean
          creado_en?: string
          actualizado_en?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
