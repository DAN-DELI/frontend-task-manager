// Validacion en formulario de registro

import { hideContainer, showContainer } from "../../../utils/index.js";

export const validateLoginForm = () => {
    // Selectores del DOM
    const formDocument = document.querySelector('#documento');
    const formPassword = document.querySelector('#password');
    const errorDocument = document.querySelector('#document-error');
    const errorPassword = document.querySelector('#password-error');

    let isValid = true;

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

    return isValid;
};