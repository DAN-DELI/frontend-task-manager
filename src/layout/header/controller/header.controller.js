import { clearTokens, navigateTo } from '../../../utils/index.js';

export const headerInit = () => {
    console.log("Header initialized");
    document.querySelector('#btn-logout')
        ?.addEventListener('click', () => {
            clearTokens();
            localStorage.removeItem('user');
            navigateTo('#/login');
        });
}