import React from 'react';
import { LoginForm } from '@/components/common/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <main className="login-main">
        <LoginForm />
      </main>
      <footer className="login-footer">
        <p>&copy; 2025 Sistema GPS. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}; 