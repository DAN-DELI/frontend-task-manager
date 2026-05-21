import { hideContainer, showContainer } from "../../../utils/index.js";

// Validar nueva contraseña
export const validateResetPassword = () => {
    const formPassword = document.querySelector("#new-password");
    const errorPassword = document.querySelector("#error-new-password");

    let isValid = true;
    const passValue = formPassword.value;

    if (!passValue) {
        errorPassword.textContent = 'La contraseña es obligatoria';
        showContainer(errorPassword);
        isValid = false;
    } else if (passValue.length < 8) {
        errorPassword.textContent = 'La contraseña debe tener al menos 8 caracteres';
        showContainer(errorPassword);
        isValid = false;
    } else if (passValue.length > 80) {
        errorPassword.textContent = 'La contraseña no puede exceder los 80 caracteres';
        showContainer(errorPassword);
        isValid = false;
    } else {
        errorPassword.textContent = '';
        hideContainer(errorPassword);
    }

    return isValid;
}


// Validar confirmacion de contraseña
export const validateConfirmPassword = () => {

    // Selectores del DOM
    const formPassword = document.querySelector("#new-password");
    const formConfirmPassword = document.querySelector("#confirm-password");
    const errorConfirmPassword = document.querySelector("#error-confirm-password");

    let isValid = true

    // Validar que la primera contraseña ya este indicada
    if (formPassword.value !== formConfirmPassword.value) {
        errorConfirmPassword.textContent = "Las contraseñas no coinciden"
        showContainer(errorConfirmPassword);
        isValid = false;
    } else {
        hideContainer(errorConfirmPassword);
    }

    return isValid
}