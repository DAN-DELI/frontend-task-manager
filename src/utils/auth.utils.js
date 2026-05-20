    //                      AUTH UTILS - apiFetch
    // Wrapper de fetch que:
    //  1. Adjunta el access token en cada petición.
    //  2. Si recibe 401, intenta refrescar el token automáticamente.
    //  3. Reintenta las peticiones que estaban en cola con el nuevo token.
    //  4. Si el refresh falla (token expirado/revocado), limpia la sesión
    //     y redirige al login.

    import { API_URL, PORT } from '../config/api.config';
    import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './localStorage';
    import { navigateTo } from './navigation';

    const BASE_URL = `${API_URL}:${PORT}`;

    // Cola de peticiones que llegaron mientras se estaba refrescando el token
    let isRefreshing = false;
    let pendingRequests = [];

    /**
     * Resuelve o rechaza todas las peticiones en cola.
     * @param {Error|null} error
     * @param {string|null} token - Nuevo access token si el refresh fue exitoso
     */
    const processQueue = (error, token = null) => {
        pendingRequests.forEach(req => {
            if (error) req.reject(error);
            else req.resolve(token);
        });
        pendingRequests = [];
    };

    /**
     * Realiza una petición fetch añadiendo headers base y el Bearer token.
     * @param {string} endpoint - Ruta relativa (/api/tasks) o URL absoluta
     * @param {RequestInit} options - Opciones de fetch
     * @param {string|null} token - Access token a usar
     */
    const makeRequest = (endpoint, options, token) => {
        const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

        return fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers, // permite sobreescribir headers si es necesario
            },
        });
    };

    /**
     * Wrapper principal de fetch autenticado.
     * Maneja automáticamente el refresco del access token y la cola de peticiones.
     *
     * @param {string} endpoint - Ruta del recurso (ej: '/api/tasks')
     * @param {RequestInit} options - Opciones de fetch (method, body, etc.)
     * @returns {Promise<Response>} Respuesta HTTP
     * @throws {Error} Si la sesión expiró y no fue posible renovarla
     *
     * @example
     * const res = await apiFetch('/api/tasks');
     * const data = await res.json();
     *
     * @example
     * const res = await apiFetch('/api/tasks', {
     *     method: 'POST',
     *     body: JSON.stringify(newTask),
     * });
     */
    export const apiFetch = async (endpoint, options = {}) => {

        // Primer intento con el access token actual
        let res = await makeRequest(endpoint, options, getAccessToken());

        // Si no es 401, la petición fue exitosa o tiene otro tipo de error (devolver tal cual)
        if (res.status !== 401) return res;

        // --- Access token expirado: gestionar refresco ---

        // Si ya hay un refresco en curso, encolar esta petición y esperar
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingRequests.push({
                    resolve: (newToken) => resolve(makeRequest(endpoint, options, newToken)),
                    reject: (err) => reject(err),
                });
            });
        }

        isRefreshing = true;

        try {
            // Solicitar nuevo access token al backend
            const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: getRefreshToken() }),
            });

            if (!refreshRes.ok) throw new Error('Refresh token inválido o expirado');

            const data = await refreshRes.json();
            const newAccessToken = data?.data?.accessToken;

            if (!newAccessToken) throw new Error('El servidor no retornó un access token');

            // Guardar el nuevo access token (el backend solo renueva el access token)
            setTokens(newAccessToken);

            // Reintentar la petición original con el nuevo token
            res = await makeRequest(endpoint, options, newAccessToken);

            // Resolver todas las peticiones que estaban en cola
            processQueue(null, newAccessToken);

            return res;

        } catch (err) {

            // El refresh falló: limpiar sesión y redirigir al login
            processQueue(err, null);
            clearTokens();
            navigateTo('#/login');
            throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');

        } finally {
            isRefreshing = false;
        }
    };

    export const hasPermission = (permissionCode) => {
        const userString = localStorage.getItem('user');
        if (!userString) return false;

        try {
            const user = JSON.parse(userString);

            // 1. Verificar si es Administrador (Buscamos 'role', 'rol', o si es un objeto con 'name')
            const roleName = user.role?.name || user.rol?.name || user.role || user.rol;
            
            if (roleName === 'Administrador') {
                return true; // El administrador siempre tiene acceso total
            }

            // 2. Extraer los permisos (Buscamos 'permissions' o 'permisos')
            const perms = user.permissions || user.permisos || [];

            // CASO A: Los permisos vienen como un arreglo de textos: ['users.view', 'tasks.create']
            if (Array.isArray(perms) && typeof perms[0] === 'string') {
                return perms.includes(permissionCode);
            }

            // CASO B: Los permisos vienen como un arreglo de objetos: [{ code: 'users.view' }, { code: 'tasks.create' }]
            if (Array.isArray(perms) && typeof perms[0] === 'object') {
                // Comparamos buscando la propiedad 'code' o 'codigo' dentro del objeto
                return perms.some(p => p.code === permissionCode || p.codigo === permissionCode || p.name === permissionCode);
            }

            // CASO C: Los permisos vienen como un texto separado por comas: "users.view, tasks.create"
            if (typeof perms === 'string') {
                const permissionsArray = perms.split(',').map(p => p.trim());
                return permissionsArray.includes(permissionCode);
            }

            return false;

        } catch (error) {
            console.error('Error al validar los permisos:', error);
            return false;
        }
    };