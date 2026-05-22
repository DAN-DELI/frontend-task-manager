import { hasAnyPermission } from '../../../utils/index';
import { NAV_CONFIG } from '../view/navItems.view';

/**
 * Genera el marcado HTML para los elementos del menú de navegación,
 * filtrando los accesos según los permisos del usuario autenticado.
 * @function generateNavItems
 * @returns {string} Cadena de texto con la estructura HTML de las etiquetas `<li>`.
 */
export const generateNavItems = () => {

    return NAV_CONFIG.filter(item => {
        if (item.requiredPerms.length === 0) return true;
        return hasAnyPermission(item.requiredPerms);
    })
        .map(item => `
        <li class="nav-item">
        <a href="${item.href}" class="nav-link" data-route="${item.route}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-text">${item.text}</span>
        </a>
      </li>
    `).join('');
};