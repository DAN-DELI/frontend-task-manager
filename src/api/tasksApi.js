// ---------------------------------------------------------------
// ---------------------------------------------------------------
// API DE TAREAS
// Funciones encapsuladas para comunicarse con el backend (json-server)
// ---------------------------------------------------------------

/**
 * Obtiene todas las tareas desde el endpoint `/tasks`.
 * @returns {Promise<Array>} Lista de tareas en formato JSON
 * @throws {Error} Si la respuesta HTTP no es OK
 */
export async function fetchTasks() {
    const res = await fetch(`http://localhost:3000/tasks`);
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
    const res = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });
    
    const response = await res.json();

    if (!response.success) {
        const errorMsg = response.errors ? response.errors.join(", ") : response.message;
        throw new Error(errorMsg || "Error al registrar tarea");
    }

    return response; 
}

/**
 * Actualiza campos de una tarea existente (PATCH).
 * @param {number|string} id - Identificador de la tarea
 * @param {Object} updatedData - Campos a actualizar
 * @returns {Promise<Object>} Tarea actualizada
 * @throws {Error} Si la respuesta HTTP no es OK
 */
export async function updateTaskApi(id, updatedData) {
    const res = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    });
    
    const response = await res.json();

    if (!response.success) {
        throw new Error(response.message || "No se pudo actualizar la tarea");
    }
    return response.data; 
}

/**
 * Elimina una tarea por su ID.
 * @param {number|string} id - Identificador de la tarea
 * @returns {Promise<boolean>} true si se eliminó correctamente
 * @throws {Error} Si la respuesta HTTP no es OK
 */
export async function deleteTaskApi(id) {
    const res = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: "DELETE"
    });
    
    const response = await res.json();

    if (!response.success) {
        throw new Error(response.message || "No se pudo eliminar la tarea");
    }
    
    return response;
}