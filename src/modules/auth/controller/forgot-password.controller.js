import { forgotPassword } from "../../../api/index.js";
import { hideContainer, showToast } from "../../../utils/index.js";
import { validateForgotPasswordForm } from "../validation/forgot-password.validation.js";

export const forgotPasswordInit = () => {
    const form = document.querySelector('#forgot-form');
    const emailInput = document.querySelector('#forgot-email');
    const errorEmail = document.querySelector('#email-error');

    // Limpiar error al escribir 
    emailInput.addEventListener('input', () => {
        errorEmail.textContent = '';
        hideContainer(errorEmail);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();

        if (!validateForgotPasswordForm()) {
            return;
        }

        // Solicitar enlace de recuperación al backend
        const data = await forgotPassword(email);

        // Si el backend reporta un fallo
        if (!data.success) {
            const errorMessage = data.message || 'Error al solicitar enlace de recuperación';
            showToast(errorMessage, "error");
            console.error('Error en solicitud de recuperación:', data);
            return;
        }

        // Manejar el flujo de éxito para avisar al usuario
        showToast("Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña", "success", 5000);
        form.reset();
    });
};