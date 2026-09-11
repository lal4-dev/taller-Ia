import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'TaskPulse | Gestión Inteligente de Tareas con Supabase',
  description: 'Aplicación de lista de tareas moderna, rápida y segura construida con Next.js, Supabase y PostgreSQL con Row Level Security.',
  keywords: ['next.js', 'supabase', 'todo list', 'postgresql', 'react', 'ia curso'],
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
