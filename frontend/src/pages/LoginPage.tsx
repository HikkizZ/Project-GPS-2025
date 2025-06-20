import React from 'react';
import { LoginForm } from '@/components/common/LoginForm';
import { useUI } from '@/context';

export const LoginPage: React.FC = () => {
  const { error, setError } = useUI();
  return (
    <div className="login-page">
      <main className="login-main">
        <LoginForm error={error} setError={setError} />
      </main>
      <footer className="login-footer">
        <p>&copy; 2025 Sistema GPS. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}; 