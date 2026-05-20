//                      MANEJO DE TOKENS
// Fuente única de verdad para leer, guardar y limpiar tokens
// en el localStorage. Prefijo "tm_" para evitar colisiones.

const ACCESS_KEY  = 'tm_accessToken';
const REFRESH_KEY = 'tm_refreshToken';

/** Obtiene el access token almacenado */
export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);

/** Obtiene el refresh token almacenado */
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

/**
 * Guarda los tokens en el localStorage.
 * @param {string} access        - Nuevo access token
 * @param {string|null} refresh  - Nuevo refresh token (null = no actualizar)
 */
export const setTokens = (access, refresh = null) => {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
};

/** Elimina ambos tokens del localStorage */
export const clearTokens = () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
};