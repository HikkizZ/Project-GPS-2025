import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context';
import { LoginData } from '@/types/auth.types';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSuccess?: () => void;
  error: string;
  setError: (msg: string) => void;
}

// Componente reutilizable para input de contraseña con toggle de visibilidad
export const PasswordInput: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
  isInvalid?: boolean;
  feedback?: string;
  disabled?: boolean;
  name?: string;
  autoComplete?: string;
}> = ({ value, onChange, placeholder, maxLength, isInvalid, feedback, disabled, name, autoComplete }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="input-group">
      <input
        type={show ? 'text' : 'password'}
        className={`form-control${isInvalid ? ' is-invalid' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        name={name}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        tabIndex={-1}
        onClick={() => setShow(s => !s)}
        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        <i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`}></i>
      </button>
      {isInvalid && feedback && <div className="invalid-feedback d-block">{feedback}</div>}
    </div>
  );
};

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, error, setError }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
    };
  }, []);

  // useEffect(() => {
  //   setError('Este es un mensaje de error de prueba');
  // }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(formData);
      if (result.success) {
        onSuccess?.();
        navigate('/dashboard');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      setError(err?.message || 'Error inesperado al iniciar sesión');
    }
  };

  return (
    <div className="bg-light d-flex justify-content-center" style={{ minHeight: '100vh', paddingTop: '15vh' }}>
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
        <div className="card shadow" style={{ borderRadius: 12 }}>
          <div className="card-header bg-primary text-white text-center header-text-white">
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
                <label className="form-label">Correo de Empresa:</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  placeholder="Ingrese su correo de empresa"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña:</label>
                <PasswordInput
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingrese su contraseña"
                  disabled={isLoading}
                  autoComplete="current-password"
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
          </div>
        </div>
      </div>
    </div>
  );
}; 