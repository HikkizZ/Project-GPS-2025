import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoginData } from '@/types/auth.types';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      onSuccess?.();
      navigate('/dashboard');
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="bg-light d-flex justify-content-center" style={{ minHeight: '100vh', paddingTop: '15vh' }}>
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
        <div className="card shadow" style={{ borderRadius: 12 }}>
          <div className="card-header bg-primary text-white text-center">
            <h4 className="mb-0">
              <i className="bi bi-truck me-2"></i>
              S.G. Lamas
            </h4>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger alert-dismissible fade show">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="patricia.gonzalez@lamas.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña:</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="204dm1n8"
                  required
                  disabled={isLoading}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Iniciando Sesión...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>
            <div className="mt-3">
              <small className="text-muted">
                <strong>Credenciales de prueba:</strong><br/>
                <strong>Admin:</strong> patricia.gonzalez@lamas.com / 204dm1n8
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 