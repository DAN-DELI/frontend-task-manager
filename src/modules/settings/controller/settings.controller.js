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
    const doc      = document.querySelector('#profile-document').value.trim();
    let valid = true;

    clearErrors('profile-name-error', 'profile-email-error', 'profile-document-error');

    if (name.length < 3) {
        setFieldError('profile-name-error', 'El nombre debe tener al menos 3 caracteres');
        valid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError('profile-email-error', 'Ingresa un correo electrónico válido');
        valid = false;
    }

    if (doc && !/^\d{5,15}$/.test(doc)) {
        setFieldError('profile-document-error', 'El documento debe contener entre 5 y 15 dígitos');
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
    const doc  = document.querySelector('#profile-document').value.trim();
    const btn    = document.querySelector('#btn-save-profile');

    // Verificar si hubo cambios reales
    if (name === user.name && email === user.email && doc === String(user.document ?? '')) {
        showToast('No hay cambios para guardar', 'info');
        return;
    }

    btn.disabled    = true;
    btn.textContent = 'Guardando...';

    try {

        const payload = { name, email };
        if (doc && doc !== String(user.document ?? '')) payload.document = doc;
        const result = await updateProfile(user.id, payload);

        if (!result.success) {
            if (result.errors?.length) {
                result.errors.forEach(err => {
                    const fieldMap = {
                        document: 'profile-document-error',
                        email:    'profile-email-error',
                        name:     'profile-name-error',
                    };
                    const errorId = fieldMap[err.field];
                    if (errorId) setFieldError(errorId, err.message);
                });
            } else {
                showToast(result.message, 'error');  // ← solo si no hay errores de campo
            }
            return;
        }

        // Actualizar datos en localStorage para reflejar los cambios
        const updatedFields = { name, email };
        if (payload.document) updatedFields.document = doc;

        updateStoredUser(updatedFields);
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

const ALL_THEMES = ['dark', 'light', 'midnight', 'forest', 'sunset', 'lavender', 'ocean', 'rose', 'mocha'];

const applyTheme = (theme) => {
    // Quitar todos los temas del body
    document.body.classList.remove(
        'light-theme',
        'theme-midnight',
        'theme-forest',
        'theme-sunset',
        'theme-lavender',
        'theme-ocean',
        'theme-rose',
        'theme-mocha'
    );

    // Aplicar el tema seleccionado
    if (theme === 'light')    document.body.classList.add('light-theme');
    if (theme === 'midnight') document.body.classList.add('theme-midnight');
    if (theme === 'forest')   document.body.classList.add('theme-forest');
    if (theme === 'sunset')   document.body.classList.add('theme-sunset');
    if (theme === 'lavender') document.body.classList.add('theme-lavender');
    if (theme === 'ocean')    document.body.classList.add('theme-ocean');
    if (theme === 'rose')     document.body.classList.add('theme-rose');
    if (theme === 'mocha')    document.body.classList.add('theme-mocha');

    // Marcar visualmente la opción activa
    ALL_THEMES.forEach(t => {
        document.querySelector(`#theme-${t}`)?.classList.toggle('theme-active', t === theme);
    });
};

const initThemeToggle = () => {
    const savedTheme = localStorage.getItem(THEME_KEY) ?? 'dark';
    applyTheme(savedTheme);

    ALL_THEMES.forEach(theme => {
        document.querySelector(`#theme-${theme}`)?.addEventListener('click', () => {
            localStorage.setItem(THEME_KEY, theme);
            applyTheme(theme);
        });
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