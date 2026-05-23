import { hideContainer, showContainer } from "../../../utils/index.js";


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
//             VALIDAR DATOS DEL FORMULARIO
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
export const validateRegisterForm = () => {
    // Selectores del DOM
    const formName = document.querySelector('#fullname');
    const formDocument = document.querySelector('#reg-documento');
    const formEmail = document.querySelector('#email');
    const formPassword = document.querySelector('#reg-password');
    const formConfirm = document.querySelector('#reg-password-confirm');

    const errorName = document.querySelector('#error-fullname');
    const errorDocument = document.querySelector('#error-documento');
    const errorEmail = document.querySelector('#error-email');
    const errorPassword = document.querySelector('#error-password');
    const errorConfirm = document.querySelector('#error-password-confirm');

    let isValid = true;

    // ========================================================
    //                    VALIDAR NOMBRE
    // ========================================================
    const nameValue = formName.value.trim();

    if (!nameValue) {
        errorName.textContent = 'El nombre es obligatorio';
        showContainer(errorName);
        isValid = false;
    } else if (nameValue.length < 3) {
        errorName.textContent = 'El nombre debe tener al menos 3 caracteres';
        showContainer(errorName);
        isValid = false;
    } else if (nameValue.length > 100) {
        errorName.textContent = 'El nombre no puede exceder los 100 caracteres';
        showContainer(errorName);
        isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nameValue)) {
        errorName.textContent = 'El nombre solo debe contener letras';
        showContainer(errorName);
        isValid = false;
    } else {
        errorName.textContent = '';
        hideContainer(errorName);
    }

    // ========================================================
    //                    VALIDAR DOCUMENTO
    // ========================================================
    const docValue = formDocument.value.trim();

    if (!docValue) {
        errorDocument.textContent = 'El documento es obligatorio';
        showContainer(errorDocument);
        isValid = false;
    } else if (!/^[1-9][0-9]*$/.test(docValue)) {
        errorDocument.textContent = 'El documento solo debe contener números y no puede iniciar en 0';
        showContainer(errorDocument);
        isValid = false;
    } else if (docValue.length < 5) {
        errorDocument.textContent = 'El documento debe tener al menos 5 dígitos';
        showContainer(errorDocument);
        isValid = false;
    } else if (docValue.length > 20) {
        errorDocument.textContent = 'El documento no puede exceder los 20 dígitos';
        showContainer(errorDocument);
        isValid = false;
    } else {
        errorDocument.textContent = '';
        hideContainer(errorDocument);
    }

    // ========================================================
    //                    VALIDAR EMAIL
    // ========================================================
    const emailValue = formEmail.value.trim();

    if (!emailValue) {
        errorEmail.textContent = 'El correo electrónico es obligatorio';
        showContainer(errorEmail);
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        errorEmail.textContent = 'El correo electrónico no es válido';
        showContainer(errorEmail);
        isValid = false;
    } else if (emailValue.length > 100) {
        errorEmail.textContent = 'El correo electrónico no puede exceder los 100 caracteres';
        showContainer(errorEmail);
        isValid = false;
    } else {
        errorEmail.textContent = '';
        hideContainer(errorEmail);
    }

    // ========================================================
    //                    VALIDAR PASSWORD
    // ========================================================
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

    // ========================================================
    //              VALIDAR CONFIRMACIÓN PASSWORD
    // ========================================================
    const confirmValue = formConfirm.value;

    if (!confirmValue) {
        errorConfirm.textContent = 'Debes confirmar tu contraseña';
        showContainer(errorConfirm);
        isValid = false;
    } else if (confirmValue !== passValue) {
        errorConfirm.textContent = 'Las contraseñas no coinciden';
        showContainer(errorConfirm);
        isValid = false;
    } else {
        errorConfirm.textContent = '';
        hideContainer(errorConfirm);
    }

    return isValid;
};



// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
//              VALIDAR CONFIRMACIÓN PASSWORD
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
export const validatePasswordConfirmation = () => {
    const formPassword = document.querySelector('#reg-password');
    const formConfirm = document.querySelector('#reg-password-confirm');
    const errorConfirm = document.querySelector('#error-password-confirm');

    if (formConfirm.value !== formConfirm.value) {
        errorConfirm.textContent = 'Las contraseñas no coinciden';
        showContainer(errorConfirm);
        return false;
    }

    return true;
};