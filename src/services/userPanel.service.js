// ---------------------------------------------------------------
// SERVICIO DE USUARIO
// Encapsula lógica relacionada con usuarios y comunicación con la API
// ---------------------------------------------------------------

import { fetchUserByDocument } from "../api/usersApi.js";
import { clearError, showError } from "../ui/uiState.js";

/**
 * Valida y retorna los datos de un usuario por su ID.
 * - Si el usuario no existe, retorna `null` (passthrough desde la API).
 *
 * @param {number|string} document - Identificador del usuario a validar
 * @returns {Promise<Object|null>} Usuario o null
 */
export async function validateUserService(document) {
    try {
        // La API ya retorna response.data (el objeto usuario)
        const user = await fetchUserByDocument(document);
        return user;

    } catch (error) {
        console.log(`[ERROR]: ${error}`)
    }
}

/**
 * Valida los campos de un formulario de tareas, mostrando errores si los contiene
 *
 * @param {HTMLElement} taskTable - Contenedor del formulario donde se buscarán los inputs y mensajes de error.
 * @returns {boolean} `true` si todos los campos cumplen las validaciones, `false` en caso contrario.
 */
export function userValidateForm(taskTable) {
    // 1. Selección de contenedores que almacenan el valor
    const titleInput = taskTable.querySelector("#taskTitleArea");
    const descInput = taskTable.querySelector("#taskDescriptionArea");
    const statusSelect = taskTable.querySelector("#taskStatusArea");

    // 2. Selección de áreas de error
    const errorTitle = taskTable.querySelector("#taskTitleError");
    const errorDescription = taskTable.querySelector("#taskDescriptionError");
    const errorStatus = taskTable.querySelector("#taskStatusError");

    let isValid = true;

    // --- VALIDACIÓN DE TÍTULO (Zod: min 5, max 150) ---
    const titleValue = titleInput.value.trim();
    if (titleValue.length < 5) {
        showError(errorTitle, "El título debe tener al menos 5 caracteres");
        isValid = false;
    } else if (titleValue.length > 150) {
        showError(errorTitle, "El título no puede exceder los 150 caracteres");
        isValid = false;
    } else {
        clearError(errorTitle);
    }

    // --- VALIDACIÓN DE DESCRIPCIÓN (Zod: min 5, max 2000) ---
    const descValue = descInput.value.trim();
    if (descValue.length < 5) {
        showError(errorDescription, "La descripción debe tener al menos 5 caracteres");
        isValid = false;
    } else if (descValue.length > 2000) {
        showError(errorDescription, "La descripción no puede exceder los 2000 caracteres");
        isValid = false;
    } else {
        clearError(errorDescription);
    }

    // --- VALIDACIÓN DE ESTADO (Zod: enum) ---
    if (statusSelect.value === "") {
        showError(errorStatus, "Debes seleccionar un estado");
        isValid = false;
    } else {
        clearError(errorStatus)
    }

    return isValid;
}