import { hideContainer, showContainer } from "../../../utils/index.js";

export const validateForgotPasswordForm = () => {
    // Selectores del DOM
    const formEmail = document.querySelector('#forgot-email');
    const errorEmail = document.querySelector('#email-error');

    let isValid = true;

    // ========================================================
    //                    VALIDAR EMAIL
    // ========================================================
    const emailValue = formEmail.value.trim();

    if (!emailValue) {
        errorEmail.textContent = 'El correo electrónico es obligatorio';
        showContainer(errorEmail);
        isValid = false;

    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        errorEmail.textContent = 'Ingresa un correo electrónico válido';
        showContainer(errorEmail);
        isValid = false;

    } else {
        errorEmail.textContent = '';
        hideContainer(errorEmail);
    }

    return isValid;
};