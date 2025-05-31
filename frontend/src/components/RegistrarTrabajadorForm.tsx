import React, { useState, useCallback } from 'react';
import { useTrabajador } from '@/hooks/useTrabajador';
import { CreateTrabajadorData, Trabajador } from '@/types/trabajador.types';

interface Props {
  onSuccess: (trabajador: Trabajador) => void;
  onCancel: () => void;
}

export const RegistrarTrabajadorForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const { createTrabajador, isLoading, error, clearError, validateRUT, formatRUT } = useTrabajador();
  
  const [formData, setFormData] = useState<CreateTrabajadorData>({
    rut: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    telefono: '',
    correo: '',
    numeroEmergencia: '',
    direccion: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones del frontend
    const errors: Record<string, string> = {};
    
    if (!validateRUT(formData.rut)) {
      errors.rut = 'RUT inválido';
    }
    
    if (formData.nombres.length < 2) {
      errors.nombres = 'Nombres debe tener al menos 2 caracteres';
    }
    
    if (formData.apellidoPaterno.length < 2) {
      errors.apellidoPaterno = 'Apellido paterno debe tener al menos 2 caracteres';
    }
    
    if (formData.apellidoMaterno.length < 2) {
      errors.apellidoMaterno = 'Apellido materno debe tener al menos 2 caracteres';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      errors.correo = 'Email inválido';
    }
    
    if (formData.telefono.length < 9) {
      errors.telefono = 'Teléfono debe tener al menos 9 dígitos';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    
    try {
      const result = await createTrabajador(formData);
      if (result.success && result.trabajador) {
        onSuccess(result.trabajador);
      } else {
        setValidationErrors({ submit: result.error || 'Error al crear trabajador' });
      }
    } catch (error) {
      console.error('Error al crear trabajador:', error);
      setValidationErrors({ submit: 'Error al crear trabajador' });
    }
  };

  const handleChange = (field: keyof CreateTrabajadorData, value: string) => {
    // Para el RUT, aplicar formato
    if (field === 'rut') {
      const formattedRUT = formatRUT(value);
      setFormData(prev => ({ ...prev, rut: formattedRUT }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Limpiar error del campo específico
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-plus me-2"></i>
                Registrar Nuevo Trabajador
              </h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={clearError}></button>
                </div>
              )}

              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Nota:</strong> Al registrar un trabajador se creará automáticamente una ficha de empresa 
                con valores por defecto que podrás editar inmediatamente.
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">RUT: <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.rut ? 'is-invalid' : ''}`}
                      value={formData.rut}
                      onChange={(e) => handleChange('rut', e.target.value)}
                      onKeyDown={(e) => console.log('Key pressed:', e.key)}
                      placeholder="12345678-9"
                      required
                    />
                    {validationErrors.rut && (
                      <div className="invalid-feedback">{validationErrors.rut}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha de Ingreso: <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.fechaIngreso}
                      onChange={(e) => handleChange('fechaIngreso', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nombres: <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.nombres ? 'is-invalid' : ''}`}
                      value={formData.nombres}
                      onChange={(e) => handleChange('nombres', e.target.value)}
                      placeholder="Juan Carlos"
                      required
                    />
                    {validationErrors.nombres && (
                      <div className="invalid-feedback">{validationErrors.nombres}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha de Nacimiento:</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.fechaNacimiento}
                      onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Apellido Paterno: <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.apellidoPaterno ? 'is-invalid' : ''}`}
                      value={formData.apellidoPaterno}
                      onChange={(e) => handleChange('apellidoPaterno', e.target.value)}
                      placeholder="Pérez"
                      required
                    />
                    {validationErrors.apellidoPaterno && (
                      <div className="invalid-feedback">{validationErrors.apellidoPaterno}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Apellido Materno: <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.apellidoMaterno ? 'is-invalid' : ''}`}
                      value={formData.apellidoMaterno}
                      onChange={(e) => handleChange('apellidoMaterno', e.target.value)}
                      placeholder="González"
                      required
                    />
                    {validationErrors.apellidoMaterno && (
                      <div className="invalid-feedback">{validationErrors.apellidoMaterno}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email: <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className={`form-control ${validationErrors.correo ? 'is-invalid' : ''}`}
                      value={formData.correo}
                      onChange={(e) => handleChange('correo', e.target.value)}
                      placeholder="juan.perez@gmail.com"
                      required
                    />
                    {validationErrors.correo && (
                      <div className="invalid-feedback">{validationErrors.correo}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Teléfono: <span className="text-danger">*</span></label>
                    <input
                      type="tel"
                      className={`form-control ${validationErrors.telefono ? 'is-invalid' : ''}`}
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      placeholder="+56912345678"
                      required
                    />
                    {validationErrors.telefono && (
                      <div className="invalid-feedback">{validationErrors.telefono}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Teléfono de Emergencia:</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.numeroEmergencia}
                      onChange={(e) => handleChange('numeroEmergencia', e.target.value)}
                      placeholder="+56987654321"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Dirección: <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.direccion}
                      onChange={(e) => handleChange('direccion', e.target.value)}
                      placeholder="Av. Principal 123, Comuna, Ciudad"
                      required
                    />
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Registrar Trabajador
                      </>
                    )}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 