import { updateProfile, changePassword } from '../../../api/settings.api.js';
import { showToast } from '../../../utils/index.js';

//                      UTILIDADES INTERNAS

/** Obtiene el usuario del localStorage */
const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};

/** Actualiza los datos del usuario en el localStorage */
const updateStoredUser = (updatedFields) => {
    const user = getCurrentUser();
    if (!user) return;
    localStorage.setItem('user', JSON.stringify({ ...user, ...updatedFields }));
};

/** Muestra u oculta un mensaje de error bajo un campo */
const setFieldError = (id, message = '') => {
    const el = document.querySelector(`#${id}`);
    if (!el) return;
    if (message) {
        el.textContent = message;
        el.classList.remove('hidden');
    } else {
        el.textContent = '';
        el.classList.add('hidden');
    }
};

/** Limpia todos los errores de un formulario */
const clearErrors = (...ids) => ids.forEach(id => setFieldError(id));

//                    TOGGLE MOSTRAR CONTRASEÑA

const initPasswordToggles = () => {
    document.querySelectorAll('.btn-toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.querySelector(`#${targetId}`);
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            btn.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
        });
    });
};

//                    SECCIÓN: EDITAR PERFIL

const validateProfileForm = () => {
    const name  = document.querySelector('#profile-name').value.trim();
    const email = document.querySelector('#profile-email').value.trim();
    let valid = true;

    clearErrors('profile-name-error', 'profile-email-error');

    if (name.length < 3) {
        setFieldError('profile-name-error', 'El nombre debe tener al menos 3 caracteres');
        valid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError('profile-email-error', 'Ingresa un correo electrónico válido');
        valid = false;
    }

    return valid;
};

const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    const user   = getCurrentUser();
    const name   = document.querySelector('#profile-name').value.trim();
    const email  = document.querySelector('#profile-email').value.trim();
    const btn    = document.querySelector('#btn-save-profile');

    // Verificar si hubo cambios reales
    if (name === user.name && email === user.email) {
        showToast('No hay cambios para guardar', 'info');
        return;
    }

    btn.disabled    = true;
    btn.textContent = 'Guardando...';

    try {
        const result = await updateProfile(user.id, { name, email });

        if (!result.success) {
            const msg = result.errors?.length
                ? result.errors.map(e => e.message ?? e).join(', ')
                : result.message;
            showToast(msg, 'error');
            return;
        }

        // Actualizar datos en localStorage para reflejar los cambios
        updateStoredUser({ name, email });
        showToast(result.message, 'success');

    } catch (err) {
        console.error('[ERROR] handleProfileSave:', err.message);
        showToast('No se pudo actualizar el perfil', 'error');
    } finally {
        btn.disabled    = false;
        btn.textContent = 'Guardar cambios';
    }
};

//                  SECCIÓN: CAMBIAR CONTRASEÑA

const validatePasswordForm = () => {
    const current  = document.querySelector('#current-password').value;
    const newPass  = document.querySelector('#new-password').value;
    const confirm  = document.querySelector('#confirm-password').value;
    let valid = true;

    clearErrors('current-password-error', 'new-password-error', 'confirm-password-error');

    if (!current) {
        setFieldError('current-password-error', 'La contraseña actual es obligatoria');
        valid = false;
    }

    if (newPass.length < 8) {
        setFieldError('new-password-error', 'La nueva contraseña debe tener al menos 8 caracteres');
        valid = false;
    }

    if (newPass !== confirm) {
        setFieldError('confirm-password-error', 'Las contraseñas no coinciden');
        valid = false;
    }

    return valid;
};

const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    const user    = getCurrentUser();
    const current = document.querySelector('#current-password').value;
    const newPass = document.querySelector('#new-password').value;
    const confirm = document.querySelector('#confirm-password').value;
    const btn     = document.querySelector('#btn-save-password');

    btn.disabled    = true;
    btn.textContent = 'Cambiando...';

    try {
        const result = await changePassword(user.id, {
            currentPassword: current,
            newPassword:     newPass,
            confirmPassword: confirm,
        });

        if (!result.success) {
            // Si el error viene con campo específico, mostrarlo bajo el input
            if (result.errors?.length) {
                result.errors.forEach(err => {
                    const fieldMap = {
                        currentPassword: 'current-password-error',
                        newPassword:     'new-password-error',
                        confirmPassword: 'confirm-password-error',
                    };
                    const errorId = fieldMap[err.field];
                    if (errorId) setFieldError(errorId, err.message);
                });
            }
            showToast(result.message, 'error');
            return;
        }

        // Limpiar el formulario tras éxito
        document.querySelector('#password-form').reset();
        showToast(result.message, 'success');

    } catch (err) {
        console.error('[ERROR] handlePasswordSave:', err.message);
        showToast('No se pudo cambiar la contraseña', 'error');
    } finally {
        btn.disabled    = false;
        btn.textContent = 'Cambiar contraseña';
    }
};

//                     SECCIÓN: APARIENCIA

const THEME_KEY = 'tm_theme';

const applyTheme = (theme) => {
    document.body.classList.toggle('light-theme', theme === 'light');

    // Marcar visualmente la opción activa
    document.querySelector('#theme-dark')?.classList.toggle('theme-active', theme === 'dark');
    document.querySelector('#theme-light')?.classList.toggle('theme-active', theme === 'light');
};

const initThemeToggle = () => {
    const savedTheme = localStorage.getItem(THEME_KEY) ?? 'dark';
    applyTheme(savedTheme);

    document.querySelector('#theme-dark')?.addEventListener('click', () => {
        localStorage.setItem(THEME_KEY, 'dark');
        applyTheme('dark');
    });

    document.querySelector('#theme-light')?.addEventListener('click', () => {
        localStorage.setItem(THEME_KEY, 'light');
        applyTheme('light');
    });
};

//                       INIT PRINCIPAL

export const settingsInit = () => {
    document.querySelector('#profile-form')
        ?.addEventListener('submit', handleProfileSave);

    document.querySelector('#password-form')
        ?.addEventListener('submit', handlePasswordSave);

    initPasswordToggles();
    initThemeToggle();
};