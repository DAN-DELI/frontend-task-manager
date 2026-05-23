import { forgotPassword } from "../../../api/index.js";
import { hideContainer, showToast } from "../../../utils/index.js";
import { validateForgotPasswordForm } from "../validation/forgot-password.validation.js";

export const forgotPasswordInit = () => {

    // ========================================================
    //                  SELECTORES DEL DOM
    // ========================================================
    const form = document.querySelector('#forgot-form');
    const emailInput = document.querySelector('#forgot-email');
    const errorEmail = document.querySelector('#email-error');
    const btnSubmit = document.querySelector('#btn-forgot-submit');

    // ========================================================
    //           EVENTO => LIMPIAR ERRORES AL ESCRIBIR
    // ========================================================
    emailInput.addEventListener('input', () => {
        errorEmail.textContent = '';
        hideContainer(errorEmail);
    });

    // ========================================================
    //       EVENTO => ENVIAR LINK DE RESTABLECIMIENTO
    // ========================================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();

        if (!validateForgotPasswordForm()) {
            return;
        }

        // Bloquear botón antes de la petición
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Enviando...';

        try {
            // Solicitar enlace de recuperación al backend
            const data = await forgotPassword(email);

            // Si el backend reporta un fallo
            if (!data.success) {
                const errorMessage = data.message || 'Error al solicitar enlace de recuperación';
                showToast(errorMessage, "error");
                console.error('Error en solicitud de recuperación:', data);

                // Restaurar botón en error de negocio
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Enviar enlace';
                return;
            }

            // Manejar el flujo de éxito para avisar al usuario
            showToast('Correo enviado. Revisa tu bandeja.', 'success', 4000);
            form.reset();

            // Restaurar botón tras éxito
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Enviar enlace';

        } catch (error) {
            console.error('Error de red en recuperación:', error);
            showToast('Error de conexión. Intenta de nuevo.', 'error');

            // Restaurar botón en error de red
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Enviar enlace';
        }
    });
};