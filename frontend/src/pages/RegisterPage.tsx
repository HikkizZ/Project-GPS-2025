import React from 'react';

export const RegisterPage: React.FC = () => {
  return (
    <div className="register-page">
      <header className="register-header">
        <h1>Sistema GPS 2025</h1>
        <p>Registro de Nuevo Usuario</p>
      </header>
      
      <main className="register-main">
        <div className="register-form-container">
          <form className="register-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input type="text" id="nombre" name="nombre" required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input type="email" id="email" name="email" required />
            </div>

            <div className="form-group">
              <label htmlFor="role">Rol</label>
              <select id="role" name="role" required>
                <option value="">Seleccione un rol</option>
                <option value="Empleado">Empleado</option>
                <option value="RecursosHumanos">Recursos Humanos</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input type="password" id="password" name="password" required />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required />
            </div>

            <button type="submit" className="register-button">
              Registrar Usuario
            </button>
          </form>
        </div>
      </main>
      
      <footer className="register-footer">
        <p>&copy; 2025 Sistema GPS. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}; 