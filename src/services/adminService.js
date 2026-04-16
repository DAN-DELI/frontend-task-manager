// ---------------------------------------------------------------
// SERVICIO DE ADMINISTRACIÓN (LÓGICA DE NEGOCIO)
// Contiene la lógica de filtrado y procesamiento de datos del admin
// ---------------------------------------------------------------

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