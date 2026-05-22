// ---------------------------------------------------------------
//                     API DE PERMISOS
// ---------------------------------------------------------------
// Funciones para consultar los permisos generales del sistema.
// Separadas de roles.api.js porque estas no requieren un chequeo
// de permisos administrativos — cualquier usuario autenticado puede
// consultarlas para el armado dinámico de la interfaz (ej. menús o vistas).

import { apiFetch } from '../utils/auth.utils';

/**
 * Obtiene el catálogo completo de permisos disponibles en el sistema.
 * @returns {Promise<Object>} Respuesta completa con la lista de permisos { success, message, data }
 */
export async function getAllPermissions() {
    const res = await apiFetch('/api/permissions');
    const data = await res.json();

    return data;
}