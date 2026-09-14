
/**
 * Auth Guard - Control de Acceso a Rutas Protegidas
 *  Bloquear acceso directo a rutas sin permisos
 */

import { showAlert } from '../utils/notification.js';

/**
 * Obtener datos del usuario autenticado desde localStorage
 */
export const getCurrentUser = () => {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error parsing userData:', error);
        return null;
    }
};

/**
 * Verificar si el usuario tiene token válido
 */
export const isUserAuthenticated = () => {
    const token = localStorage.getItem('tm_accessToken');
    return !!token;
};

/**
 * Verificar si usuario tiene permiso para gestionar usuarios
 * (Requiere roles: administrador o evaluador)
 */
export const hasUserManagementPermission = () => {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Verificar si tiene roles
    if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
        return false;
    }
    
    // Verificar si es admin o evaluador
    const hasRole = user.roles.some(r => {
        const roleName = typeof r === 'string' ? r : r.name;
        return roleName === 'Administrador' || roleName === 'Evaluador';
    });
    
    return hasRole;
};

/**
 * Guard para acceso a gestión de usuarios
 * Bloquea el acceso y redirige si no tiene permisos
 */
export const checkUserManagementAccess = () => {
    // Primero verificar autenticación
    if (!isUserAuthenticated()) {
        showAlert('error', 'Debe iniciar sesión para acceder', 'Acceso Denegado');
        window.location.hash = '#/login';
        return false;
    }

    // Luego verificar permisos específicos
    if (!hasUserManagementPermission()) {
        showAlert('error', 'No tiene permiso para acceder a esta sección. Solo administradores y evaluadores pueden gestionar usuarios.', 'Acceso Denegado');
        window.location.hash = '#/dashboard';
        return false;
    }

    return true;
};

/**
 * Guard genérico para cualquier ruta que requiera autenticación
 */
export const requireAuth = () => {
    if (!isUserAuthenticated()) {
        showAlert('error', 'Debe iniciar sesión', 'Acceso Denegado');
        window.location.hash = '#/login';
        return false;
    }
    return true;
};

/**
 * Verificar si usuario tiene un rol específico
 */
export const userHasRole = (roleName) => {
    const user = getCurrentUser();
    if (!user || !user.roles || !Array.isArray(user.roles)) {
        return false;
    }
    
    return user.roles.some(r => {
        const rName = typeof r === 'string' ? r : r.name;
        return rName === roleName;
    });
};

/**
 * Verificar si usuario es administrador
 */
export const isAdmin = () => {
    return userHasRole('administrador');
};

/**
 * Verificar si usuario es evaluador
 */
export const isEvaluator = () => {
    return userHasRole('evaluador');
};

/**
 * Verificar si usuario es aprendiz
 */
export const isApprentice = () => {
    return userHasRole('aprendiz');
};