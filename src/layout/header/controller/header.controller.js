import { clearTokens, navigateTo } from '../../../utils/index.js';

export const headerInit = () => {

    // ========================================================
    //                       EVENTOS
    // ========================================================

    // Cerrar sesión
    document.querySelector('#btn-logout')
        ?.addEventListener('click', () => {
            clearTokens();
            localStorage.removeItem('user');
            navigateTo('#/login');
        });


}
