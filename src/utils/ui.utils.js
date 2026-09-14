// ocultar contenedor
export const hideContainer = (container) => {
    container.classList.add('hidden');
}

// mostrar contenedor
export const showContainer = (container) => {
    container.classList.remove('hidden');
}


/**
 * Alterna la visibilidad de un input password.
 * 
 * @param {string} buttonId - id HTML del boton inicializador
 * @param {string} inputId  - id HTML del input
 */
export const setupPasswordToggle = (buttonId, inputId) => {

    const button = document.querySelector(`#${buttonId}`);

    const input = document.querySelector(`#${inputId}`);

    const eyeShow = button.querySelector(".eye-show");

    const eyeHide = button.querySelector(".eye-hide");

    button.addEventListener("click", () => {

        const isPassword =
            input.type === "password";

        input.type = isPassword
            ? "text"
            : "password";

        eyeShow.style.display = isPassword
            ? "none"
            : "block";

        eyeHide.style.display = isPassword
            ? "block"
            : "none";

    });

};