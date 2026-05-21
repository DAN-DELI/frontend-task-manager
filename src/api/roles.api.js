import { apiClient } from './apiClient.js';

/**
 * Obtiene todos los roles del sistema.
 * @returns {Promise<Array>} Lista de roles { id, name, description }
 */
export const fetchRoles = async () => {
    const res = await apiClient('/api/roles');
    return res?.data ?? res;
};

/**
 * Obtiene un rol por su ID.
 * @param {number|string} id
 * @returns {Promise<Object>} Rol { id, name, description }
 */
export const fetchRoleById = async (id) => {
    const res = await apiClient(`/api/roles/${id}`);
    return res?.data ?? res;
};

/**
 * Crea un nuevo rol.
 * @param {{ name: string, description: string }} roleData
 * @returns {Promise<Object>} Respuesta { success, message, data }
 */
export const createRole = async (roleData) => {
    return await apiClient('/api/roles', {
        method: 'POST',
        body: JSON.stringify(roleData),
    });
};

/**
 * Actualiza parcialmente un rol existente.
 * @param {number|string} id
 * @param {{ name?: string, description?: string }} roleData
 * @returns {Promise<Object>} Respuesta { success, message, data }
 */
export const updateRolePartial = async (id, roleData) => {
    return await apiClient(`/api/roles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(roleData),
    });
};

/**
 * Elimina un rol por su ID.
 * @param {number|string} id
 * @returns {Promise<Object>} Respuesta { success, message }
 */
export const deleteRole = async (id) => {
    return await apiClient(`/api/roles/${id}`, {
        method: 'DELETE',
    });
};