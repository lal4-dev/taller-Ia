/**
 * ==============================================================================
 * PÁGINA: ACCESO Y REGISTRO (/login)
 * ==============================================================================
 * Renderiza el contenedor centrado para el formulario de autenticación.
 */

import { AuthForm } from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="auth-container">
        <AuthForm />
      </div>
    </div>
  );
}
