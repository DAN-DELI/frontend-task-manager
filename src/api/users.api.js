//                        API DE USUARIOS
// Funciones para comunicarse con el backend en /api/users.
// Todas las peticiones son autenticadas y manejan el refresco
// de token automáticamente a través de apiFetch.

import { apiFetch } from '../utils/auth.utils';

// OPERACIONES GET 

/**
 * Obtiene todos los usuarios del sistema.
 * @returns {Promise<Array>} Lista completa de usuarios
 * @throws {Error} Si hay error de servidor
 */
export async function fetchUsers() {
    const res = await apiFetch('/api/users');
    const response = await res.json();

    if (!response.success) {
        throw new Error(response.message || 'Error al obtener los usuarios');
    }

    return response.data;
}

/**
 * Obtiene un usuario por su ID.
 * @param {number|string} id - ID del usuario
 * @returns {Promise<Object|null>} Objeto usuario o null si no existe
 * @throws {Error} Si hay error de servidor (distinto a 404)
 */
export async function fetchUserById(id) {    
    // Si tienes problemas de 404, prueba quitando el '/api' de la siguiente línea
    const res = await apiFetch(`/api/users/${id}`); 
    const response = await res.json();

    if (!response.success) {
        console.warn("⚠️ El backend retornó success: false", response);
        return null;
    }

    // Solución al problema de las consultas MySQL: si es un arreglo, tomamos el primer objeto
    if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0];
    }

    return response.data;
}

/**
 * Obtiene un usuario buscando por número de documento (?document=...).
 * @param {number|string} document - Número de documento
 * @returns {Promise<Object>} Respuesta completa { success, message, data, errors }
 * @throws {Error} Si hay error 5xx de servidor
 */
export async function fetchUserByDocument(document) {
    const res = await apiFetch(`/api/users?document=${document}`);

    if (res.status >= 500) {
        throw new Error('Error del servidor al buscar el usuario');
    }

    const response = await res.json();
    return response; // { success, message, data, errors }
}

/**
 * Obtiene los roles asignados a un usuario.
 * @param {number|string} id - ID del usuario
 * @returns {Promise<Array>} Lista de roles del usuario
 * @throws {Error} Si hay error de servidor
 */
export async function fetchUserRoles(id) {
    const res = await apiFetch(`/api/users/${id}/roles`);
    const response = await res.json();

    if (!response.success) {
        throw new Error(response.message || 'Error al obtener los roles del usuario');
    }

    return response.data;
}

/**
 * Obtiene los permisos efectivos de un usuario.
 * @param {number|string} id - ID del usuario
 * @returns {Promise<Array>} Lista de permisos del usuario
 * @throws {Error} Si hay error de servidor
 */
export async function fetchUserPermissions(id) {
    const res = await apiFetch(`/api/users/${id}/permissions`);
    const response = await res.json();

    if (!response.success) {
        throw new Error(response.message || 'Error al obtener los permisos del usuario');
    }

    return response.data;
}

// OPERACIONES POST 

/**
 * Crea un nuevo usuario en el sistema.
 * @param {Object} userData - Datos del usuario (name, email, document, password)
 * @returns {Promise<Object>} Respuesta completa { success, message, data, errors }
 * @throws {Error} Si hay error de servidor
 */
export async function createUser(userData) {
    const res = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
    });

    const response = await res.json();
    return response;
}

// OPERACIONES PUT 

/**
 * Reemplaza completamente un usuario (todos los campos requeridos).
 * @param {number|string} id - ID del usuario
 * @param {Object} userData - Objeto completo con los datos del usuario
 * @returns {Promise<Object>} Respuesta completa { success, message, data, errors }
 * @throws {Error} Si hay error de servidor
 */
export async function updateUser(id, userData) {
    const res = await apiFetch(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });

    const response = await res.json();
    return response;
}

// OPERACIONES PATCH

/**
 * Actualiza parcialmente un usuario (solo los campos enviados).
 * @param {number|string} id - ID del usuario
 * @param {Object} userData - Campos a modificar
 * @returns {Promise<Object>} Respuesta completa { success, message, data, errors }
 * @throws {Error} Si hay error de servidor
 */
export async function updateUserPartial(id, userData) {
    const res = await apiFetch(`/api/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(userData),
    });

    const response = await res.json();
    return response;
}

// OPERACIONES DELETE

/**
 * Elimina un usuario por su ID.
 * @param {number|string} id - ID del usuario a eliminar
 * @returns {Promise<Object>} Respuesta completa { success, message, data, errors }
 * @throws {Error} Si hay error de servidor
 */
export async function deleteUser(id) {
    const res = await apiFetch(`/api/users/${id}`, {
        method: 'DELETE',
    });

    const response = await res.json();
    return response;
}

// OPERACIONES DE ASIGNACIÓN DE ROLES

/**
 * Asigna roles a un usuario.
 * @param {number|string} userId - ID del usuario
 * @param {Array<number>} roleIds - Array de IDs de roles a asignar
 * @returns {Promise<Object>} Respuesta completa { success, message, data, errors }
 * @throws {Error} Si hay error de servidor
 */
export async function assignUserRoles(userId, roleIds) {
    // El backend espera strings, no numbers (validación Zod)
    const payload = {
        userId: String(userId),
        roleIds: Array.isArray(roleIds) ? roleIds.map(String) : []
    };

    const res = await apiFetch('/api/userRoles/assign', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('[assignUserRoles] Error:', res.status, errorText);
        try { return JSON.parse(errorText); }
        catch { return { success: false, message: errorText || `Error ${res.status}` }; }
    }

    return await res.json();
}