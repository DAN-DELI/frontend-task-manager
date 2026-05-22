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
              <input type="text" id="fullname" name="fullname" placeholder="Ej: Juan Carlos">
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
                <svg class="eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg class="eye-hide" style="display: none;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <span class="error-message hidden" id="error-password"></span>
          </div>
          
          <div class="input-group">
            <label for="reg-password-confirm">Confirmar Contraseña</label>
            <div class="input-wrapper">
              <input type="password" id="reg-password-confirm" name="passwordConfirm" placeholder="Repita su contraseña">
              <button type="button" class="toggle-password" id="toggle-reg-password-confirm" aria-label="Mostrar contraseña">
                <svg class="eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg class="eye-hide" style="display: none;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
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