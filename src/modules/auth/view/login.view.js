export const LoginView = () => {

  return `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-header">
            <h2 class="auth-title">Iniciar Sesión</h2>
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
              <label for="password">Contraseña</label>
              <div class="input-wrapper">
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  placeholder="••••••••" 
                  autocomplete="current-password"
                >
                <button type="button" class="toggle-password" id="toggle-password" aria-label="Mostrar contraseña">
                </button>
              </div>
              <span class="error-message hidden" id="password-error"></span>
            </div>
            
            <button type="submit" class="btn-primary">
              <span>Entrar</span>
            </button>
          </form>
          
          <div class="auth-footer">
            <a href="#/forgot-password" class="auth-link" id="btn-forgot">¿Olvidaste tu contraseña?</a>
            
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