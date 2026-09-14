export const ForgotPasswordView = () => {
  return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h2 class="auth-title">¿Olvidaste tu contraseña?</h2>
          <p class="auth-subtitle">Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
        </div>
        
        <form id="forgot-form" class="auth-form">
          <div class="input-group">
            <label for="forgot-email">Correo electrónico</label>
            <div class="input-wrapper">
              <input 
                type="text" 
                id="forgot-email" 
                name="email"
                placeholder="correo@ejemplo.com"
              >
            </div>
            <span class="error-message hidden" id="email-error"></span>
          </div>
          
          <button type="submit" class="btn-primary" id="btn-forgot-submit">Enviar enlace</button>
        </form>
        
        <div class="auth-footer">
          <p class="auth-text">
            <a href="#/login" class="btn-link" id="btn-back-login">Volver al inicio de sesión</a>
          </p>
        </div>
      </div>
    </div>
    `;
};