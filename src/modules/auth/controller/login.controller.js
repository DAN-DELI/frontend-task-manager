import { login } from "../../../api/index.js";
import { navigateTo, showToast, setTokens, setupPasswordToggle } from "../../../utils/index.js";
import { validateLoginForm } from "../validation/login.validation.js";

export const loginInit = () => {

    // ========================================================
    //                  SELECTORES DEL DOM
    // ========================================================
    const form = document.querySelector('#login-form');
    const formDocument = document.querySelector('#documento');
    const formPassword = document.querySelector('#password');
    const btnSubmit = form.querySelector('.btn-primary');



    // ========================================================
    //             EVENTO => ALTERNAR VISIVILIDAD
    // ========================================================
    setupPasswordToggle("toggle-password", "password");


    // ========================================================
    //              EVENTO => INICIAR SECION
    // ========================================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userDocument = formDocument.value.trim();
        const userPassword = formPassword.value.trim();

        const isValid = validateLoginForm();
        if (!isValid) return;

        // Bloquear botón al iniciar el proceso
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Ingresando...';

        try {
            const userData = {
                document: userDocument,
                password: userPassword
            };

            const response = await login(userData);

            // Error de autenticación (backend respondió pero credenciales mal)
            if (!response.success) {
                const msg = response.message || 'Credenciales inválidas o no autorizadas';
                showToast(msg, 'error');

                // Restaurar botón para permitir reintentar
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Entrar';
                return;
            }

            const { accessToken, refreshToken, user } = response.data;

            // Guardar tokens usando la utilidad centralizada (claves tm_*)
            setTokens(accessToken, refreshToken);

            // Guardar datos del usuario
            localStorage.setItem('user', JSON.stringify(user));

            // Éxito: mantener botón bloqueado con texto de redirección
            btnSubmit.textContent = 'Redirigiendo...';
            showToast('Inicio de sesión exitoso. Redirigiendo a tu zona de trabajo...', 'success', 2000);

            setTimeout(() => {
                navigateTo('#/home');
            }, 2000);

        } catch (error) {
            console.error('Error crítico de conexión:', error);
            showToast('Error de conexión con el servidor. Intenta de nuevo.', 'error');

            // Restaurar botón ante fallo de red
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Entrar';
        }
    });
};