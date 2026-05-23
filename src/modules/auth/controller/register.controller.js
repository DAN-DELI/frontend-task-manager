import { register } from "../../../api/index.js";
import { navigateTo, setupPasswordToggle, showToast } from "../../../utils/index.js";
import { validatePasswordConfirmation, validateRegisterForm } from "../validation/register.validation.js";

export const registerInit = () => {

    // ========================================================
    //                  SELECTORES DEL DOM
    // ========================================================
    const form = document.querySelector('#register-form');

    const formName = document.querySelector('#fullname');
    const formDocument = document.querySelector('#reg-documento');
    const formEmail = document.querySelector('#email');
    const formPassword = document.querySelector('#reg-password');
    const formConfirm = document.querySelector('#reg-password-confirm');


    // ========================================================
    //             EVENTO => ALTERNAR VISIVILIDAD
    // ========================================================
    setupPasswordToggle('toggle-reg-password', 'reg-password');
    setupPasswordToggle('toggle-reg-password-confirm', 'reg-password-confirm');

    // ========================================================
    //         MAPA DE CAMPOS => IDs DE ERROR EN EL DOM
    // ========================================================
    const fieldMap = {
        email:    'error-email',
        document: 'error-documento',
        name:     'error-fullname',
    };

    // ========================================================
    //      UTILIDAD => LIMPIAR ERRORES INLINE DEL BACKEND
    // ========================================================
    const clearFieldErrors = () => {
        Object.values(fieldMap).forEach(id => {
            const el = document.querySelector(`#${id}`);
            if (el) { el.textContent = ''; el.classList.add('hidden'); }
        });
    };

    // ========================================================
    //      UTILIDAD => MOSTRAR ERRORES BAJO EL CAMPO
    // ========================================================
    const showFieldErrors = (errors) => {
        errors.forEach(err => {
            const errorId = fieldMap[err.field];
            if (!errorId) return;
            const el = document.querySelector(`#${errorId}`);
            if (el) {
                el.textContent = err.message;
                el.classList.remove('hidden');
            }
        });
    };
    
    // ========================================================
    //            EVENTO => RESTABLECER CONTRASEÑA
    // ========================================================
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

        // Limpiar errores de campo previos antes de cada intento
        clearFieldErrors();

        // Crear objeto con datos del formulario
        const userData = {
            name: formName.value.trim(),
            email: formEmail.value.trim(),
            document: formDocument.value.trim(),
            password: formPassword.value.trim()
        };

        const data = await register(userData);

        if (!data.success) {
    // Si el backend retorna errores por campo, mostrarlos inline
            // Si no, mostrar un toast genérico con el mensaje del servidor
            if (data.errors?.length) {
                showFieldErrors(data.errors);
            } else {
                showToast(data.message || 'Error al registrar el usuario', 'error');
            }
            return;
        }

        showToast("Registro exitoso, ya puedes iniciar sesión", "success");
        form.reset();
        setTimeout(() => navigateTo('#/login'), 3000);
    });
};