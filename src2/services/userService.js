import { createUserApi, deleteUserApi, fetchUserByDocument, fetchUsers, updateUserApi } from "../api/usersApi.js";
import { showNotification } from "../ui/notificationsUI.js";


export async function getAllUsers() {
    let allUsers = await fetchUsers();
    return allUsers
}

/**
 * Obtiene el nombre de un usuario por su ID.
 * @param {string|number} userId - ID del usuario
 * @returns {string} Nombre del usuario
 */
export function getUserNameById(userId, allUsers) {
    const user = allUsers.find(u => String(u.id) === String(userId));
    return user ? user.name : "este usuario";
}

export async function getUserByDocument(document) {
    try {
        const result = await fetchUserByDocument(document)

        if (!result.success) {
            const detail = result.errors?.length
                ? `${result.message}: ${result.errors.join(", ")}`
                : result.message;

            return { ok: false, data: null, message: detail };
        }

        return { ok: true, data: result.data };

    } catch (error) {
        console.error("[ERROR]:", error.message); // Mensaje informativo al programador
        return { ok: false, data: null };
    }
}

export async function servicePatchUser(userId, userData) {
    try {
        const result = await updateUserApi(userId, userData); // Actualizar usuario

        if (!result.success) {
            const detail = result.errors?.length
                ? `${result.message}: ${result.errors.join(", ")}`
                : result.message;

            console.error("[ERROR]: ", detail); // Mensaje informativo al programador
            showNotification("No se pudo actualizar el usuario", "error"); // Mensaje generico al usuario
            return { ok: false, data: null };
        }

        showNotification(result.message, "success");
        return { ok: true, data: result.data };

    } catch (error) {
        console.error("[ERROR]:", error.message); // Mensaje informativo al programador
        showNotification("No se pudo procesar la solicitud", "error"); // Mensaje generico al usuario
        return { ok: false, data: null };
    }
}

export async function servicePostUser(userData) {
    try {
        const result = await createUserApi(userData);

        if (!result.success) {
            const detail = result.errors?.length
                ? `${result.message}: ${result.errors.join(", ")}`
                : result.message;

            console.error("[ERROR]: ", detail); // Mensaje informativo al programador
            showNotification("No se pudo crear el usuario", "error"); // Mensaje generico al usuario
            return { ok: false, data: null };
        }

        showNotification(result.message, "success");
        return { ok: true, data: result.data };

    } catch (error) {
        console.error("[ERROR]:", error.message); // Mensaje informativo al programador
        showNotification("No se pudo procesar la solicitud", "error"); // Mensaje generico al usuario
        return { ok: false, data: null };
    }
}

export async function serviceDeleteUser(userId) {
    try {
        const result = await deleteUserApi(userId);

        if (!result.success) {
            const detail = result.errors?.length
                ? `${result.message}: ${result.errors.join(", ")}`
                : result.message;

            console.error("[ERROR]: ", detail); // Mensaje informativo al programador
            showNotification("No se pudo eliminar el usuario", "error"); // Mensaje generico al usuario
            return { ok: false, data: null };
        }

        showNotification(result.message, "success");
        return { ok: true, data: result.data }

    } catch (error) {
        console.error("[ERROR]:", error.message); // Mensaje informativo al programador
        showNotification("No se pudo procesar la solicitud", "error"); // Mensaje generico al usuario
        return { ok: false, data: null };
    }

}

