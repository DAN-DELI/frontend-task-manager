import { updateProfile, changePassword,  deleteAccount } from '../../../api/settings.api.js';
import { fetchTasks } from '../../../api/tasks.api.js';
import { showToast } from '../../../utils/index.js';
import { navigateTo } from '../../../utils/index.js';
import { PASSWORD_RULES, isPasswordSecure } from '../../auth/validation/register.validation.js';

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
    // Nombre: mínimo 3 caracteres y sin números
    if (name.length < 3) {
        setFieldError('profile-name-error', 'El nombre debe tener al menos 3 caracteres');
        valid = false;
    }   else if (/\d/.test(name)) { 
        setFieldError('profile-name-error', 'El nombre no puede contener números');
        valid = false;
    }

    // Correo: formato válido y máximo 100 caracteres
    if (!email) {
        setFieldError('profile-email-error', 'El correo electrónico es obligatorio');
        valid = false;
    } else if (email.length > 100) { 
        setFieldError('profile-email-error', 'El correo no puede superar los 100 caracteres');
        valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError('profile-email-error', 'Ingresa un correo electrónico válido');
        valid = false;
    }

    if (doc && !/^\d{5,20}$/.test(doc)) {
        setFieldError('profile-document-error', 'El documento debe contener entre 5 y 20 dígitos');
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

    if (!newPass) {
    setFieldError('new-password-error', 'La nueva contraseña es obligatoria');
} else if (!isPasswordSecure(newPass)) {
    setFieldError('new-password-error', 'La contraseña no cumple los requisitos de seguridad');
    } else if (newPass.length > 120) { 
        setFieldError('new-password-error', 'La nueva contraseña no puede exceder los 120 caracteres');
        valid = false;
    }

    if (valid && newPass !== confirm) {
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
                    else showToast(err.message || result.message, 'error');
                    });
            } else {
                showToast(result.message, 'error');
            }
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

//                  SECCIÓN: ELIMINAR CUENTA

//  Abre el modal de confirmación tras verificar tareas asignadas
const handleDeleteAccount = async () => {
    const user = getCurrentUser();
    if (!user) return;

    const btn = document.querySelector('#btn-delete-account');
    btn.disabled    = true;
    btn.textContent = 'Verificando...';

    try {
        const tasks = await fetchTasks();
        const assignedTasks = tasks.filter(task =>
            Array.isArray(task.assigned_users)
                ? task.assigned_users.some(u => String(u.id) === String(user.id))
                : String(task.user_id) === String(user.id)
        );

        if (assignedTasks.length > 0) {
            showToast(
                `No puedes eliminar tu cuenta: tienes ${assignedTasks.length} tarea(s) asignada(s). Reasígnalas antes de continuar.`,
                'error'
            );
            return;
        }

        // Mostrar modal custom en lugar de window.confirm
        openDeleteModal();

    } catch (err) {
        console.error('[ERROR] handleDeleteAccount:', err.message);
        showToast('Ocurrió un error al verificar tus tareas', 'error');
    } finally {
        if (btn) {
            btn.disabled    = false;
            btn.textContent = 'Eliminar cuenta';
        }
    }
};

// Ejecuta el DELETE tras confirmación en el modal
const confirmDeleteAccount = async () => {
    const user = getCurrentUser();
    if (!user) return;

    const confirmBtn = document.querySelector('#delete-account-confirm');
    confirmBtn.disabled    = true;
    confirmBtn.textContent = 'Eliminando...';

    try {
        const result = await deleteAccount(user.id);

        if (!result.success) {
            showToast(result.message || 'No se pudo eliminar la cuenta', 'error');
            closeDeleteModal();
            return;
        }

        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        closeDeleteModal();
        showToast('Cuenta eliminada correctamente', 'success');
        setTimeout(() => navigateTo('#/login'), 1200);

    } catch (err) {
        console.error('[ERROR] confirmDeleteAccount:', err.message);
        showToast('Ocurrió un error al intentar eliminar la cuenta', 'error');
        closeDeleteModal();
    } finally {
        if (confirmBtn) {
            confirmBtn.disabled    = false;
            confirmBtn.textContent = 'Sí, eliminar cuenta';
        }
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

//                   BLOQUEO INGRESO DE LETRAS EN DOCUMENTO

const initDocumentInput = () => {
    const docInput = document.querySelector('#profile-document');
    if (!docInput) return;

    // Permitir: backspace, delete, tab, escape, enter, flechas, home, end
    docInput.addEventListener('keydown', (e) => {
        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
        if (allowedKeys.includes(e.key)) return;
        if (e.ctrlKey || e.metaKey) return;
        // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    });

    // Limpiar cualquier letra que llegue por paste
    docInput.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text');
        const onlyDigits = pasted.replace(/\D/g, '');
        document.execCommand('insertText', false, onlyDigits);
    });
};

// helpers del modal — versión silenciosa (sin pushState) para uso interno
const _closeModalSilent = () => {
    document.querySelector('#delete-account-modal')?.classList.add('hidden');
};

// abre el modal y cambia la URL a #/settings/delete-confirm
const openDeleteModal = () => {
    document.querySelector('#delete-account-modal')?.classList.remove('hidden');
    history.pushState(null, '', '#/settings/delete-confirm');
};

// cierra el modal y devuelve la URL a #/settings
const closeDeleteModal = () => {
    _closeModalSilent();
    history.pushState(null, '', '#/settings');
};

//                       INIT PRINCIPAL

export const settingsInit = () => {
    document.querySelector('#btn-delete-account')
        ?.addEventListener('click', handleDeleteAccount);

        // Listeners del modal de confirmación
    document.querySelector('#delete-account-confirm')
        ?.addEventListener('click', confirmDeleteAccount);
    document.querySelector('#delete-account-cancel')
        ?.addEventListener('click', closeDeleteModal);
    document.querySelector('#delete-account-modal-close')
        ?.addEventListener('click', closeDeleteModal);
    document.querySelector('#delete-account-overlay')
        ?.addEventListener('click', closeDeleteModal);

    window.addEventListener('popstate', () => {
        if (window.location.hash !== '#/settings/delete-confirm') {
            _closeModalSilent();
        }
    });

    initThemeToggle();
};

//                  INIT DE EDICIÓN (vista #/settings/edit)
const updateSettingsPasswordRequirements = (password) => {
    const list = document.querySelector('#settings-password-requirements');
    if (!list) return;
    if (!password) { list.classList.add('hidden'); return; }
    list.classList.remove('hidden');
    const idMap = {
        'req-length':  's-req-length',
        'req-upper':   's-req-upper',
        'req-lower':   's-req-lower',
        'req-number':  's-req-number',
        'req-special': 's-req-special'
    };
    PASSWORD_RULES.forEach(rule => {
        const li = document.querySelector('#' + idMap[rule.id]);
        if (!li) return;
        const passed = rule.test(password);
        li.textContent = (passed ? '✓ ' : '✗ ') + rule.label;
        li.classList.toggle('req-ok', passed);
        li.classList.toggle('req-fail', !passed);
    });
};

export const settingsEditInit = () => {
    document.querySelector('#profile-form')
        ?.addEventListener('submit', handleProfileSave);

    document.querySelector('#password-form')
        ?.addEventListener('submit', handlePasswordSave);

    const newPassInput = document.querySelector('#new-password');
    newPassInput?.addEventListener('input', () => updateSettingsPasswordRequirements(newPassInput.value));
    newPassInput?.addEventListener('focus', () => updateSettingsPasswordRequirements(newPassInput.value));
    newPassInput?.addEventListener('blur',  () => {
        if (!newPassInput.value) document.querySelector('#settings-password-requirements')?.classList.add('hidden');
    });

    initPasswordToggles();
    initDocumentInput();
};