import { login } from "../../../api/index.js";
import { navigateTo, showToast, setTokens } from "../../../utils/index.js";
import { validateLoginForm } from "../validation/login.validation.js";

export const loginInit = () => {

    // ========================================================
    //                  SELECTORES DEL DOM
    // ========================================================
    const form        = document.querySelector('#login-form');
    const formDocument = document.querySelector('#documento');
    const formPassword = document.querySelector('#password');
    const btnSubmit   = form.querySelector('.btn-primary');

    // ========================================================
    //                       EVENTOS
    // ========================================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userDocument = formDocument.value.trim();
        const userPassword = formPassword.value.trim();

        const isValid = validateLoginForm();
        if (!isValid) return;

        btnSubmit.disabled    = true;
        btnSubmit.textContent = 'Ingresando...';

        try {
            const userData = {
                document: userDocument,
                password: userPassword
            };

            const response = await login(userData);

            if (!response.success) {
                const msg = response.message || 'Credenciales inválidas o no autorizadas';
                showToast(msg, 'error');
                console.error('Error de autenticación:', response);
                return;
            }

            const { accessToken, refreshToken, user } = response.data;

            // Guardar tokens usando la utilidad centralizada (claves tm_*)
            setTokens(accessToken, refreshToken);

            // Guardar datos del usuario
            localStorage.setItem('user', JSON.stringify(user));

            showToast('Inicio de sesión exitoso. Redirigiendo a tu zona de trabajo...', 'success');

            setTimeout(() => {
                navigateTo('#/navigation');
            }, 2000);

        } catch (error) {
            console.error('Error crítico de conexión:', error);

        } finally {
            btnSubmit.disabled    = false;
            btnSubmit.textContent = 'Entrar';
        }
    });
};