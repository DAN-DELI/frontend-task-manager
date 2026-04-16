// ---------------------------------------------------------------
// SERVICIO DE USUARIO
// Encapsula lógica relacionada con usuarios y comunicación con la API
// ---------------------------------------------------------------

import { fetchUserByDocument } from "../api/usersApi.js";

/**
 * Valida y retorna los datos de un usuario por su ID.
 * - Si el usuario no existe, retorna `null` (passthrough desde la API).
 *
 * @param {number|string} document - Identificador del usuario a validar
 * @returns {Promise<Object|null>} Usuario o null
 */
export async function validateUserService(document) {
    try {
        // La API ya retorna response.data (el objeto usuario)
        const user = await fetchUserByDocument(document);
        return user; 
    } catch (error) {
        // Si hay un error de red o success: false, se propaga
        throw error;
    }
}