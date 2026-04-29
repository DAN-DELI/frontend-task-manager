// ---------------------------------------------------------------
// API DE USUARIOS
// ---------------------------------------------------------------


// ---------------------------------------------------------------
// ======================= OPERACIONES GET =======================
// ---------------------------------------------------------------

/**
 * Obtiene un usuario por su ID desde el endpoint `/users/{id}`.
 * Devuelve `null` si la respuesta no es OK (por ejemplo 404).
 *
 * @param {number|string} id - Identificador del usuario
 * @returns {Promise<Object|null>} Objeto usuario o null si no existe
 */
export async function fetchUserById(id) {
    const res = await fetch(`http://localhost:3000/users/${id}`);
    const response = await res.json();

    if (!response.success) {
        return null;
    }
    return response.data;
}

/**
 * Obtiene un usuario por su número de documento desde el endpoint `/users?document={doc}`.
 * Devuelve `null` si no se encuentra el usuario o hay un error.
 *
 * @param {number|string} document - Número de documento del usuario
 * @returns {Promise<Object|null>} Objeto usuario o null si no existe
 */
export async function fetchUserByDocument(document) {

    const res = await fetch(`http://localhost:3000/users?document=${document}`);

    if (res.status >= 500) {
        throw new Error("Error del servidor al buscar usuario usuario");
    }

    const response = await res.json();
    return response; // retorna { success, message, data, errors }
}

/**
 * Obtiene TODOS los usuarios desde el endpoint `/users`.
 * @returns {Promise<Array>} Lista completa de usuarios
 */
export async function fetchUsers() {
    const res = await fetch(`http://localhost:3000/users`);
    const response = await res.json();

    if (!response.success) {
        throw new Error(response.message || "Error al obtener usuarios");
    }

    return response.data;
}


// ---------------------------------------------------------------
// ===================== OPERACIONES DELETE ======================
// ---------------------------------------------------------------

/**
 * Elimina un usuario por su ID.
 * @param {number|string} id 
 */
export async function deleteUserApi(id) {
    const res = await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE"
    });

    if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
    };

    const response = await res.json();
    return response; // retorna { success, message, data, errors }
}


// ---------------------------------------------------------------
// ====================== OPERACIONES PATCH ======================
// ---------------------------------------------------------------

/**
 * Actualiza los datos de un usuario (PATCH).
 */
export async function updateUserApi(id, userData) {
    const res = await fetch(`http://localhost:3000/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
    }

    const response = await res.json(); // Parsear respuesta
    return response; // retorna { success, message, data, errors }
}

// ---------------------------------------------------------------
// ======================= OPERACIONES POST ======================
// ---------------------------------------------------------------
/**
 * Crea un nuevo usuario en el sistema.
 * @param {Object} userData 
 */
export async function createUserApi(userData) {
    const res = await fetch(`http://localhost:3000/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
    }

    const response = await res.json(); // Parsear respuesta
    return response; // retorna { success, message, data, errors }
}