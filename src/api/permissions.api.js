import { apiClient } from './apiClient.js';

/**
 * Obtiene todos los permisos del sistema.
 * @returns {Promise<Array>} Lista de permisos { id, code, name, description }
 */
export const fetchPermissions = async () => {
    const res = await apiClient('/api/permissions');
    return res?.data ?? res;
};