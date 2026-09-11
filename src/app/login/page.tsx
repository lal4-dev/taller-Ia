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
