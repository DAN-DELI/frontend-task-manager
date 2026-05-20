import { register } from "../../../api/index.js";
import { navigateTo, showToast } from "../../../utils/index.js";
import { validatePasswordConfirmation, validateRegisterForm } from "../validation/register.validation.js";

export const registerInit = () => {

    // Selectores del DOM
    const form = document.querySelector('#register-form');

    const formName = document.querySelector('#fullname');
    const formDocument = document.querySelector('#reg-documento');
    const formEmail = document.querySelector('#email');
    const formPassword = document.querySelector('#reg-password');
    const formConfirm = document.querySelector('#reg-password-confirm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar formulario
        if (!validateRegisterForm()) {
            return;
        }

        // Validar que las contraseñas coincidan
        if (!validatePasswordConfirmation()) {
            return;
        };

        // Crear objeto con datos del formulario
        const userData = {
            name: formName.value.trim(),
            email: formEmail.value.trim(),
            document: formDocument.value.trim(),
            password: formPassword.value.trim()
        };

        const data = await register(userData);

        if (!data.success) {
            const errorMessage = data.message || 'Error al registrar el usuario';
            showToast(errorMessage, "error");
            console.error('Error en registro:', data);
            return;
        };

        showToast("Registro exitoso, ya puedes iniciar sesión", "success");
        form.reset();

        setTimeout(() => {
            navigateTo('/login');
        }, 3000);
    });
};