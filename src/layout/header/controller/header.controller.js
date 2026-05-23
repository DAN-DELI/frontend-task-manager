import { clearTokens, navigateTo, showConfirm, showConfirmThenAlert, showToast } from '../../../utils/index.js';
import { headerLayout } from '../view/header.view.js';
import { generateNavItems } from './navItems.controller.js';


export const headerInit = () => {

    // ========================================================
    //                 SELECTORES DEL DOM
    // ========================================================
    const btnLogout = document.querySelector('#btn-logout');

    // ========================================================
    //                  EVENTO => CERRAR SESIÓN
    // ========================================================
    btnLogout.addEventListener('click', async () => {
        const confirmed = await showConfirmThenAlert(
            "¿Cerrar sesión?",
            "Se cerrará tu sesión actual.",
            "¡Hasta pronto!",
            "Sesión cerrada exitosamente.",
            "Confirmar",
            "Cancelar",
            () => {
                clearTokens();
                localStorage.removeItem('user');
                navigateTo('#/login');
            }
        );
    });
}



