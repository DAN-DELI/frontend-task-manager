//                      API DE SETTINGS
// Funciones para las operaciones del perfil propio del usuario.
// Separadas de users.api.js porque estas no requieren permisos
// administrativos — cualquier usuario puede editar su propio perfil.

import { apiFetch } from '../utils/auth.utils';

/**
 * Actualiza el perfil del usuario autenticado (nombre y/o email).
 * @param {number|string} id   - ID del usuario
 * @param {Object} profileData - Campos a actualizar { name?, email? }
 * @returns {Promise<Object>} Respuesta completa { success, message, data, errors }
 */
export async function updateProfile(id, profileData) {
    const res = await apiFetch(`/api/users/${id}/profile`, {
        method: 'PATCH',
        body: JSON.stringify(profileData),
    });
    return res.json();
}

/**
 * Cambia la contraseña del usuario autenticado.
 * @param {number|string} id       - ID del usuario
 * @param {Object} passwordData    - { currentPassword, newPassword, confirmPassword }
 * @returns {Promise<Object>} Respuesta completa { success, message, data, errors }
 */
export async function changePassword(id, passwordData) {
    const res = await apiFetch(`/api/users/${id}/change-password`, {
        method: 'POST',
        body: JSON.stringify(passwordData),
    });
    return res.json();
}