import { login } from "../../../api/index.js";
import { navigateTo, showToast } from "../../../utils/index.js";
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
    //                       EVENTOS
    // ========================================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userDocument = formDocument.value.trim();
        const userPassword = formPassword.value.trim();

        // Validar formulario
        const isValid = validateLoginForm();

        if (!isValid) {
            return;
        }

        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Ingresando...';

        try {

            // Definir cuerpo de la solicitud
            const userData = {
                document: userDocument,
                password: userPassword
            };

            // Enviar login al backend
            const response = await login(userData);

            // En caso de error o credenciales invalidas
            if (!response.success) {
                const confirm = (response.message || 'Credenciales inválidas o no autorizadas');
                showToast(confirm, "error");
                console.error('Error de autenticación:', response);
                return;
            }

            // Guardar tokens y datos del usuario en localtorage
            const accessToken = response.data.accessToken;
            const refreshToken = response.data.refreshToken;
            const user = response.data.user;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            // Redirigir al layout dinámico
            showToast('Inicio de sesión exitoso. Redirigiendo a tu zona de trabajo...', 'success');


            // Esperar un momento para mostrar el mensaje de éxito
            setTimeout(() => {
                navigateTo('#/navigation');
            }, 2000);

        } catch (error) {
            console.error('Error crítico de conexión:', error);

        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Entrar';
        }
    }


    );
};