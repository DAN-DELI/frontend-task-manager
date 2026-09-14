export const LoginView = () => {

  return `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-header">
            <h2 class="auth-title">Iniciar Sesion</h2>
            <p class="auth-subtitle">Ingresa tus credenciales para continuar</p>
          </div>
          
          <form id="login-form" class="auth-form">
            <div class="input-group">
              <label for="documento">Documento</label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  id="documento" 
                  name="documento"
                  placeholder="Ingrese su documento" 
                  autocomplete="username"
                >
              </div>
              <span class="error-message hidden" id="document-error"></span>
            </div>
            
            <div class="input-group">
              <label for="password">Contrasena</label>
              <div class="input-wrapper">
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  placeholder="••••••••" 
                  autocomplete="current-password"
                >
                <button type="button" class="toggle-password" id="toggle-password" aria-label="Mostrar contrasena">
                  <svg class="eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg class="eye-hide" style="display: none;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
              <span class="error-message hidden" id="password-error"></span>
            </div>
            
            <button type="submit" class="btn-primary">
              <span>Entrar</span>
            </button>
          </form>
          
          <div class="auth-footer">
            <a href="#/forgot-password" class="auth-link" id="btn-forgot">¿Olvidaste tu contrasena?</a>
            
            <div class="auth-divider">
              <span>o</span>
            </div>
            
            <p class="auth-text">
              ¿No tienes cuenta? 
              <a href="#/register" class="btn-link" id="btn-to-register">Registrarse</a>
            </p>
          </div>
        </div>
      </div>
    `;
};