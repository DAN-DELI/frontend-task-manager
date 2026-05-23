/**
 * @module reset-password.view
 * @description Plantilla HTML de la vista "Nueva contraseña".
 * 
 */
export const resetPasswordView = () => {
    return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h2 class="auth-title">Nueva contraseña</h2>
          <p class="auth-subtitle">Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.</p>
        </div>
        
        <form id="reset-form" class="auth-form">
          <div class="input-group">
            <label for="new-password">Nueva contraseña</label>
            <div class="input-wrapper">
              <input 
                type="password" 
                id="new-password" 
                name="newPassword"
                placeholder="Minimo 8 caracteres"
                autocomplete="new-password"
              >
              <button type="button" class="toggle-password" id="toggle-new-password" aria-label="Mostrar contrasena">
                <svg class="eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg class="eye-hide" style="display: none;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <span class="error-message hidden" id="error-new-password"></span>
          </div>
          
          <div class="input-group">
            <label for="confirm-password">Confirmar contrasena</label>
            <div class="input-wrapper">
              <input 
                type="password" 
                id="confirm-password" 
                name="confirmPassword"
                placeholder="Repite la contrasena"
                autocomplete="new-password"
              >
              <button type="button" class="toggle-password" id="toggle-confirm-password" aria-label="Mostrar contrasena">
                <svg class="eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg class="eye-hide" style="display: none;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <span class="error-message hidden" id="error-confirm-password"></span>
          </div>
          
          <div class="auth-note hidden" id="reset-msg"></div>
          
          <button type="submit" class="btn-primary" id="btn-reset-submit">Cambiar contrasena</button>
        </form>
      </div>
    </div>
    `;
};