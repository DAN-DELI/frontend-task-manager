// ---------------------------------------------------------------
// ---------------------------------------------------------------
// API DE TAREAS
// Funciones encapsuladas para comunicarse con el backend (json-server)
// ---------------------------------------------------------------

import { API_URL, PORT } from "../../src/config/api.config";

const url_base = `${API_URL}:${PORT}`
/**
 * Obtiene todas las tareas desde el endpoint `/tasks`.
 * @returns {Promise<Array>} Lista de tareas en formato JSON
 * @throws {Error} Si la respuesta HTTP no es OK
 */
export async function fetchTasks() {
    const res = await fetch(`${url_base}/tasks`);
    const response = await res.json(); // Estructura: { success, message, data, errors }

    if (!response.success) {
        throw new Error(response.message || "Error al obtener tareas");
    }
    return response.data; // Retornamos solo el array de tareas
}

/**
 * Crea una nueva tarea en el backend.
 * @param {Object} task - Objeto tarea a crear
 * @returns {Promise<Object>} Tarea creada
 * @throws {Error} Si la respuesta HTTP no es OK
 */
export async function createTask(task) {
    const res = await fetch(`${url_base}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });

    if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
    }

    const response = await res.json(); // Parsear respuesta
    return response; // Retorna { success, message, data, errors }
}

/**
 * Actualiza campos de una tarea existente (PATCH).
 * @param {number|string} id - Identificador de la tarea
 * @param {Object} updatedData - Campos a actualizar
 * @returns {Promise<Object>} Tarea actualizada
 * @throws {Error} Si la respuesta HTTP no es OK
 */
export async function updateTaskApi(id, updatedData) {
    const res = await fetch(`${url_base}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    });

    if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
    }

    const response = await res.json(); // parsear JSON
    return response; // Retorna { success, message, data, errors }
}

/**
 * Elimina una tarea por su ID.
 * @param {number|string} id - Identificador de la tarea
 * @returns {Promise<boolean>} true si se eliminó correctamente
 * @throws {Error} Si la respuesta HTTP no es OK o si success es false
 */
export async function deleteTaskApi(id) {
    const res = await fetch(`${url_base}/tasks/${id}`, {
        method: "DELETE"
    });

    if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
    }

    const response = await res.json();

    return response;
}