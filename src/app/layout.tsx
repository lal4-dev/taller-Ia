import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

/**
 * ==============================================================================
 * LAYOUT RAÍZ GLOBAL (RootLayout)
 * ==============================================================================
 * Define la estructura HTML base compartida por todas las rutas de la aplicación:
 * - Inyección de metadatos SEO.
 * - Carga de la hoja de estilos global (`globals.css`).
 * - Configuración del idioma (`es`).
 */

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#09090b',
};

export const metadata: Metadata = {
  title: 'TaskPulse | Gestión Inteligente de Tareas con Supabase',
  description: 'Aplicación de lista de tareas moderna, rápida y segura construida con Next.js, Supabase y PostgreSQL con Row Level Security.',
  keywords: ['next.js', 'supabase', 'todo list', 'postgresql', 'react', 'ia curso', 'openspec'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
