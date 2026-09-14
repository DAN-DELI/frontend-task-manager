/**
 * Obtiene el usuario autenticado actualmente desde el localStorage.
 * @returns {Object|null} El objeto del usuario o `null` si no existe o está corrupto.
 */
export const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
        return null;
    }
};

/**
 * Obtiene un array con los puros códigos de permisos del usuario.
 * @returns {string[]} Lista de códigos (ej. `["tasks.view", "users.create"]`).
 */
export const getPermissions = () => {
    const user = getUser();
    if (!user?.permissions) return [];
    return user.permissions.map(p => p.code);
};

/**
 * Verifica si el usuario tiene un permiso específico.
 * @param {string} code - Código del permiso a validar (ej. 'tasks.view').
 * @returns {boolean}
 */
export const havePermission = (code) => getPermissions().includes(code);

/**
 * Verifica si el usuario tiene al menos uno de los permisos del array.
 * @param {string[]} codes - Lista de códigos a evaluar (ej. `['tasks.edit', 'admin.all']`).
 * @returns {boolean}
 */
export const hasAnyPermission = (codes) => {
    const perms = getPermissions();
    return codes.some(code => perms.includes(code));
};