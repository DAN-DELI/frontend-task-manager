import { resetPassword } from "../../../api";
import { navigateTo, setupPasswordToggle, showConfirm, showToast } from "../../../utils/index";
import { validateConfirmPassword, validateResetPassword } from "../validation/reset-password.validation";

export const resetPasswordInit = ({ token }) => {

    const form = document.querySelector("#reset-form");
    const passwordInput = document.querySelector("#new-password");
    const confirmPasswordInput = document.querySelector("#confirm-password");
    const btnSubmit = document.querySelector("#btn-reset-submit");


    // ========================================================
    //             EVENTOS => ALTERNAR VISIVILIDAD
    // ========================================================
    setupPasswordToggle("toggle-new-password", "new-password");
    setupPasswordToggle("toggle-confirm-password", "confirm-password");


    // ========================================================
    //            EVENTO => RESTABLECER CONTRASEÑA
    // ========================================================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newPassword = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (!validateResetPassword()) return;
        if (!validateConfirmPassword()) return;

        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Restableciendo...';

        try {
            const response = await resetPassword(token, newPassword);

            if (!response.success) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Restablecer contrasena';

                showConfirm(
                    "error",
                    "El enlace ha expirado o ya fue utilizado. Solicita uno nuevo para continuar.",
                    "Error al restablecer contrasena",
                    "Solicitar nuevo link",
                    () => {
                        navigateTo("#/forgot-password");
                    }
                );

                return;
            }

            // Confirmar accion y redirigir al login
            showToast("Contrasena restablecida correctamente", "success");
            setTimeout(() => {
                window.location.hash = '#/login';
            }, 2000);

        } catch (error) {
            console.error("Error al restablecer la contrasena:", error);

            showToast(error.message, "error");

            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Restablecer contrasena';
        }
    });
};