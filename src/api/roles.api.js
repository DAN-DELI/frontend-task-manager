//                        API DE ROLES
// Funciones para comunicarse con el backend en /api/roles.
// Todas las peticiones son autenticadas y manejan el refresco
// de token automáticamente a través de apiFetch.

import { apiFetch } from '../utils/auth.utils';

/**
 * Obtiene todos los roles del sistema.
 * @returns {Promise<Array>} Lista completa de roles
 * @throws {Error} Si hay error de servidor
 */
export async function fetchRoles() {
    const res = await apiFetch('/api/roles');
    const response = await res.json();

    if (!response.success) {
        throw new Error(response.message || 'Error al obtener los roles');
    }

    return response.data;
}