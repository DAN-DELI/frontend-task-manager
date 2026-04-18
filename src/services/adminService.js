// ---------------------------------------------------------------
// SERVICIO DE ADMINISTRACIÓN (LÓGICA DE NEGOCIO)
// Contiene la lógica de filtrado y procesamiento de datos del admin
// ---------------------------------------------------------------

import { fetchUserByDocument } from "../api/usersApi.js";
import { clearError, showError } from "../ui/uiState.js";

/**
 * Aplica filtros de búsqueda y estado a una lista de tareas.
 * 
 * @param {Array} allTasks - Lista completa de tareas
 * @param {Array} allUsers - Lista completa de usuarios
 * @param {string} searchTerm - Término de búsqueda (nombre, descripción, título, ID)
 * @param {string} statusValue - Estado a filtrar ("all" para todos)
 * @returns {Array} Tareas que coinciden con los filtros
 */
export function applyAdminTaskFilters(allTasks, allUsers, searchTerm, statusValue) {
    // Aseguramos que el buscador tenga un valor, si no, cadena vacía
    const search = (searchTerm || "").toLowerCase();
    const status = statusValue;

    return allTasks.filter(task => {
        // 1. Validar estado
        const currentStatus = task.status || "";
        const matchStatus = status === "all" || currentStatus === status;

        // 2. Buscar al usuario
        const taskUser = allUsers.find(u => String(u.id) === String(task.user_id));
        const userName = taskUser ? (taskUser.name || "").toLowerCase() : "";

        // 3. Validar descripción 
        const desc = (task.description || "").toLowerCase();
        const title = (task.title || "").toLowerCase();

        const matchSearch = desc.includes(search) ||
            title.includes(search) ||
            userName.includes(search) ||
            String(task.id).includes(search);

        return matchStatus && matchSearch;
    });
}

/**
 * Aplica filtros de búsqueda a una lista de usuarios.
 * 
 * @param {Array} allUsers - Lista completa de usuarios
 * @param {string} searchTerm - Término de búsqueda (nombre, email, documento, ID)
 * @returns {Array} Usuarios que coinciden con los filtros
 */
export function applyAdminUserFilters(allUsers, searchTerm) {
    if (!allUsers) allUsers = [];

    const search = (searchTerm || "").toLowerCase();

    return allUsers.filter(user => {
        const name = (user.name || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        const docId = String(user.document || user.id || "").toLowerCase();

        return name.includes(search) ||
            docId.includes(search) ||
            email.includes(search);
    });
}

/**
 * Obtiene el nombre del usuario asignado a una tarea.
 * @param {Object} task - Objeto tarea
 * @param {Array} allUsers - Lista de usuarios
 * @returns {string} Nombre del usuario o "Usuario Desconocido"
 */
export function getTaskUserName(task, allUsers) {
    const taskUser = allUsers.find(u => String(u.id) === String(task.user_id));
    return taskUser ? taskUser.name : "Usuario Desconocido";
}

/**
 * Normaliza el estado de una tarea.
 * @param {Object} task - Objeto tarea
 * @returns {string} Estado normalizado
 */
export function getTaskStatus(task) {
    return task.status || "pendiente";
}

/**
 * Cuenta cuántas tareas tiene asignadas un usuario.
 * @param {string|number} userId - ID del usuario
 * @param {Array} allTasks - Lista de tareas
 * @returns {number} Cantidad de tareas
 */
export function countUserTasks(userId, allTasks) {
    return allTasks.filter(t => String(t.user_id) === String(userId)).length;
}

/**
 * Prepara los datos de una tarea para crear múltiples copias (una por usuario).
 * @param {string} title - Título de la tarea
 * @param {string} description - Descripción de la tarea
 * @param {string} status - Estado de la tarea
 * @param {string} createdAt - Fecha de creación
 * @param {string} createdBy - Quién creó la tarea
 * @param {Array} selectedUserIds - IDs de usuarios seleccionados
 * @returns {Array} Array de objetos tarea listos para crear
 */
export function prepareMultipleTasks(title, description, status, createdAt, createdBy, selectedUserIds) {
    const baseTask = {
        title: title.trim(),
        description: description.trim(),
        status: status,
        created_at: createdAt,
        created_by: createdBy
    };

    return selectedUserIds.map(user_id => ({
        ...baseTask,
        user_id: Number(user_id)
    }));
}

/**
 * Actualiza una tarea en un array local.
 * @param {Array} allTasks - Array de tareas
 * @param {string|number} taskId - ID de la tarea a actualizar
 * @param {Object} newData - Nuevos datos de la tarea
 * @returns {Array} Nuevo array con la tarea actualizada
 */
export function updateTaskInArray(allTasks, taskId, newData) {
    const index = allTasks.findIndex(t => String(t.id) === String(taskId));
    if (index !== -1) {
        const updatedTasks = [...allTasks];
        updatedTasks[index] = { ...updatedTasks[index], ...newData };
        return updatedTasks;
    }
    return allTasks;
}

/**
 * Elimina una tarea de un array local.
 * @param {Array} allTasks - Array de tareas
 * @param {string|number} taskId - ID de la tarea a eliminar
 * @returns {Array} Nuevo array sin la tarea eliminada
 */
export function removeTaskFromArray(allTasks, taskId) {
    return allTasks.filter(t => String(t.id) !== String(taskId));
}

/**
 * Actualiza un usuario en un array local.
 * @param {Array} allUsers - Array de usuarios
 * @param {string|number} userId - ID del usuario a actualizar
 * @param {Object} newData - Nuevos datos del usuario
 * @returns {Array} Nuevo array con el usuario actualizado
 */
export function updateUserInArray(allUsers, userId, newData) {
    const index = allUsers.findIndex(u => String(u.id) === String(userId));
    if (index !== -1) {
        const updatedUsers = [...allUsers];
        updatedUsers[index] = { ...updatedUsers[index], ...newData };
        return updatedUsers;
    }
    return allUsers;
}

/**
 * Elimina un usuario de un array local.
 * @param {Array} allUsers - Array de usuarios
 * @param {string|number} userId - ID del usuario a eliminar
 * @returns {Array} Nuevo array sin el usuario eliminado
 */
export function removeUserFromArray(allUsers, userId) {
    return allUsers.filter(u => String(u.id) !== String(userId));
}

/**
 * Valida los campos de un formulario de tareas, mostrando errores si los contiene
 *
 * @param {HTMLElement} taskTable - Contenedor del formulario donde se buscarán los inputs y mensajes de error.
 * @param {boolean} [withUsers] - Id del usuario en caso de ser edicion. Si está definido, omite la validación de usuarios seleccionados.
 * @returns {boolean} `true` si todos los campos cumplen las validaciones, `false` en caso contrario.
 */
export function validateAreaForm(taskTable, withUsers) {
    // 1. Selección de contenedores que almacenan el valor
    const titleInput = taskTable.querySelector("#taskTitleArea");
    const descInput = taskTable.querySelector("#taskDescriptionArea");
    const usersContainer = taskTable.querySelector(".taskUsersArea");
    const selectedCheckboxes = usersContainer.querySelectorAll('input[type="checkbox"]:checked');
    const statusSelect = taskTable.querySelector("#taskStatusArea");

    // 2. Selección de áreas de error
    const errorTitle = taskTable.querySelector("#taskTitleError");
    const errorDescription = taskTable.querySelector("#taskDescriptionError");
    const errorUsers = taskTable.querySelector("#userSelectionError");
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

    // --- VALIDACIÓN DE USUARIOS (Al menos uno seleccionado) ---
    if (selectedCheckboxes.length === 0 && withUsers == undefined) {
        showError(errorUsers, "Debes seleccionar al menos un usuario");
        isValid = false;
    } else {
        clearError(errorUsers);
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

/**
 * Valida los campos del formulario de usuarios, mostrando errores en caso de incumplir las reglas.
 *
 * @param {HTMLElement} userModal - Contenedor del formulario (modal) donde se encuentran los inputs y mensajes de error.
 * @returns {Promise<boolean>} `true` si todos los campos son válidos, `false` en caso contrario.
 */
export async function validateUserForm(userModal) {

    // Inputs
    const nameInput = userModal.querySelector("#userName");
    const emailInput = userModal.querySelector("#userEmail");
    const documentInput = userModal.querySelector("#userDoc");
    const roleSelect = userModal.querySelector("#userRole");

    // Áreas de error
    const errorName = userModal.querySelector("#userNameError");
    const errorEmail = userModal.querySelector("#userEmailError");
    const errorDocument = userModal.querySelector("#userDocumentError");
    const errorRole = userModal.querySelector("#userRoleError");


    let isValid = true;

    // --- VALIDACIÓN DE NOMBRE (Zod: string, min 3, regex: letras/espacios) ---
    const nameValue = nameInput?.value.trim() || "";
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!nameValue) {
        showError(errorName, "El nombre es obligatorio");
        isValid = false;

    } else if (!nameRegex.test(nameValue)) {
        showError(errorName, "El nombre solo debe contener letras y espacios");
        isValid = false;

    } else if (nameValue.length < 3) {
        showError(errorName, "El nombre debe tener al menos 3 caracteres");
        isValid = false;

    } else {
        clearError(errorName)
    }

    // --- VALIDACIÓN DE EMAIL (Zod: string, email format) ---
    const emailValue = emailInput?.value.trim() || "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValue) {
        showError(errorEmail, "El correo electrónico es obligatorio");
        isValid = false;

    } else if (!emailRegex.test(emailValue)) {
        showError(errorEmail, "El correo electrónico no es válido");
        isValid = false;

    } else {
        clearError(errorEmail)
    }

    // --- VALIDACIÓN DE DOCUMENTO (Zod: string, solo numeros, no inicia por 0, min 5, unique) ---
    const documentValue = documentInput?.value.trim() || "";
    let registeredDocument = null;

    if (!documentValue) {
        showError(errorDocument, "El documento es obligatorio");
        isValid = false;

    } else if (!/^\d+$/.test(documentValue)) {
        showError(errorDocument, "El documento solo debe contener números");
        isValid = false;

    } else if (documentValue.startsWith("0")) {
        showError(errorDocument, "El documento no puede iniciar en 0");
        isValid = false;

    } else if (documentValue.length < 5) {
        showError(errorDocument, "El documento debe tener al menos 5 dígitos");
        isValid = false;

    } else {
        const currentUserId = userModal.querySelector("#editUserId")?.value;
        registeredDocument = await fetchUserByDocument(documentValue);

        if (registeredDocument && (String(registeredDocument.id) !== String(currentUserId))) {
            showError(errorDocument, "El documento ya está registrado");
            isValid = false;
        } else {
            clearError(errorDocument)
        }
    }

    return isValid;
}