
// Consulta si el usuario está autenticado verificando la presencia de un token en el localStorage

// Obtenemos el token de acceso del localStorage
export const getAccessToken = () => {
    const accessToken = localStorage.getItem('accessToken');

    return accessToken;
}

// Obtenemos el token de refresco del localStorage
export const getRefreshToken = () => {
    const refreshToken = localStorage.getItem('refreshToken');

    return refreshToken;
}

// Definir tokens en el localStorage
export const setTokens = (access, refresh) => {
    localStorage.setItem('accessToken', access);

    if (refresh) localStorage.setItem('refreshToken', refresh);
};

// Eliminar tokens del localStorage
export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};