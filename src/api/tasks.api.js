//                        API DE TAREAS
// Funciones para comunicarse con el backend en /api/tasks.
// Todas las peticiones son autenticadas y manejan el refresco
// de token automáticamente a través de apiFetch.

import { apiFetch } from '../utils/auth.utils';

// OPERACIONES GET

/**
 * Obtiene todas las tareas.
 * @returns {Promise<Array>} Lista de tareas
 * @throws {Error} Si el servidor responde con error
 */
export async function fetchTasks() {
    const res = await apiFetch('/api/tasks');
    const response = await res.json();

    if (!response.success) {
        throw new Error(response.message || 'Error al obtener las tareas');
    }

    return response.data;
}

/**
 * Obtiene una tarea por su ID.
 * @param {number|string} id - ID de la tarea
 * @returns {Promise<Object>} Objeto tarea
 * @throws {Error} Si la tarea no existe o hay error de servidor
 */
export async function fetchTaskById(id) {
    const res = await apiFetch(`/api/tasks/${id}`);
    const response = await res.json();

    if (!response.success) {
        throw new Error(response.message || 'Error al obtener la tarea');
    }

    return response.data;
}

/**
 * Obtiene las tareas propias del usuario (donde está asignado).
 * @returns {Promise<Array>} Lista de tareas asignadas al usuario
 * @throws {Error} Si el servidor responde con error
 */
export async function fetchMyTasks() {
    const res = await apiFetch('/api/tasks/my-tasks');
    const response = await res.json();

    if (!response.success) {
        throw new Error(response.message || 'Error al obtener mis tareas');
    }

    return response.data;
}

// OPERACIONES POST

/**
 * Crea una nueva tarea.
 * @param {Object} task - Datos de la tarea (user_id, title, description, status)
 * @returns {Promise<Object>} Respuesta completa { success, message, data, errors }
 * @throws {Error} Si hay error de servidor
 */
export async function createTask(task) {
    const res = await apiFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
    });

    const response = await res.json();
    return response;
}

// OPERACIONES PUT 

/**
 * Reemplaza completamente una tarea (todos los campos requeridos).
 * @param {number|string} id - ID de la tarea a reemplazar
 * @param {Object} taskData - Objeto completo de la tarea
 * @returns {Promise<Object>} Respuesta completa { success, message, data, errors }
 * @throws {Error} Si hay error de servidor
 */
export async function updateTask(id, taskData) {
    const res = await apiFetch(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
    });

    const response = await res.json();
    return response;
}

// OPERACIONES PATCH

/**
 * Actualiza parcialmente una tarea (solo los campos enviados).
 * @param {number|string} id - ID de la tarea a actualizar
 * @param {Object} taskData - Campos a modificar
 * @returns {Promise<Object>} Respuesta completa { success, message, data, errors }
 * @throws {Error} Si hay error de servidor
 */
export async function updateTaskPartial(id, taskData) {
    const res = await apiFetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(taskData),
    });

    const response = await res.json();
    return response;
}

// OPERACIONES DELETE

/**
 * Elimina una tarea por su ID.
 * @param {number|string} id - ID de la tarea a eliminar
 * @returns {Promise<Object>} Respuesta completa { success, message, data, errors }
 * @throws {Error} Si hay error de servidor
 */
export async function deleteTask(id) {
    const res = await apiFetch(`/api/tasks/${id}`, {
        method: 'DELETE',
    });

    const response = await res.json();
    return response;
}