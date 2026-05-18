export const RegisterView = () => {
  return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h2 class="auth-title">Crear Cuenta</h2>
          <p class="auth-subtitle">Completa tus datos para registrarte</p>
        </div>
        
        <form id="register-form" class="auth-form">
          <div class="input-group">
            <label for="fullname">Nombre Completo</label>
            <div class="input-wrapper">
              <input type="text" id="fullname" name="fullname" placeholder="Ej: Juan Pérez">
            </div>
            <span class="error-message hidden" id="error-fullname"></span>
          </div>
          
          <div class="input-group">
            <label for="reg-documento">Documento</label>
            <div class="input-wrapper">
              <input type="text" id="reg-documento" name="documento" placeholder="Número de identidad">
            </div>
            <span class="error-message hidden" id="error-documento"></span>
          </div>
          
          <div class="input-group">
            <label for="email">Correo Electrónico</label>
            <div class="input-wrapper">
              <input type="email" id="email" name="email" placeholder="correo@escuela.com">
            </div>
            <span class="error-message hidden" id="error-email"></span>
          </div>
          
          <div class="input-group">
            <label for="reg-password">Contraseña</label>
            <div class="input-wrapper">
              <input type="password" id="reg-password" name="password" placeholder="Cree una contraseña">
              <button type="button" class="toggle-password" id="toggle-reg-password" aria-label="Mostrar contraseña">
              </button>
            </div>
            <span class="error-message hidden" id="error-password"></span>
          </div>
          
          <div class="input-group">
            <label for="reg-password-confirm">Confirmar Contraseña</label>
            <div class="input-wrapper">
              <input type="password" id="reg-password-confirm" name="passwordConfirm" placeholder="Repita su contraseña">
              <button type="button" class="toggle-password" id="toggle-reg-password-confirm" aria-label="Mostrar contraseña">
              </button>
            </div>
            <span class="error-message hidden" id="error-password-confirm"></span>
          </div>
          
          <button type="submit" class="btn-primary">Registrarse</button>
        </form>
        
        <div class="auth-footer">
          <p class="auth-text">
            ¿Ya estás registrado? 
            <a href="#/login" class="btn-link" id="btn-to-login">Iniciar sesión</a>
          </p>
        </div>
      </div>
    </div>
  `;
};