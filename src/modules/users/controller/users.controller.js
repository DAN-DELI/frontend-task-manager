import { usersView, userCreateView, userAssignRolesView } from '../view/users.view.js';
import { fetchUsers, createUser, fetchUserById, deleteUser, fetchUserRoles, assignUserRoles } from '../../../api/users.api.js'; 
import { fetchRoles } from '../../../api/roles.api.js';
import { showAlert, showToast, showConfirmation } from '../../../utils/notification.js';

// ─── Helper: obtener IDs de checkboxes marcados ───
const getSelectedRoleIds = (contextId) => {
    const container = document.getElementById(`roles-checklist-${contextId}`);
    if (!container) return [];
    return Array.from(container.querySelectorAll('input[name="roleIds"]:checked'))
        .map(cb => Number(cb.value));
};

// ─── Helper: marcar checkboxes según IDs ───
const setSelectedRoles = (contextId, roleIds) => {
    const container = document.getElementById(`roles-checklist-${contextId}`);
    if (!container) return;
    const ids = (Array.isArray(roleIds) ? roleIds : []).map(Number);
    container.querySelectorAll('input[name="roleIds"]').forEach(cb => {
        cb.checked = ids.includes(Number(cb.value));
    });
};

// ─── Helper: renderizar badges de roles ───
const renderUserRoles = (user) => {
    let roles = [];

    if (user.roles && Array.isArray(user.roles)) {
        roles = user.roles.map(r => {
            if (typeof r === 'object') return r.name || r.roleName || 'Desconocido';
            if (typeof r === 'string') return r;
            if (typeof r === 'number') return 'Desconocido';
            return 'Desconocido';
        });
    } else if (user.role?.name) {
        roles = [user.role.name];
    } else if (user.rol?.name) {
        roles = [user.rol.name];
    } else if (user.roleId) {
        roles = ['Desconocido'];
    }

    if (roles.length === 0) return '<span class="role-badge role-sin-rol">Sin rol</span>';

    //  Mostrar máximo 3 roles, agregar "+n" si hay más
    const MAX_VISIBLE = 3;
    const visibleRoles = roles.slice(0, MAX_VISIBLE);
    const hiddenCount = Math.max(0, roles.length - MAX_VISIBLE);

    let html = visibleRoles.map(name => {
        const cssClass = `role-${name.toLowerCase().replace(/\s+/g, "-")}`;
        return `<span class="role-badge ${cssClass}">${name}</span>`;
    }).join('');

    // Si hay más roles, agregar botón "..."
    if (hiddenCount > 0) {
        const allHiddenRoles = roles.slice(MAX_VISIBLE).join(', ');
        html += `<span class="role-badge role-more" title="${allHiddenRoles}" style="cursor: help;">+${hiddenCount}</span>`;
    }

    return html;
};

// ─── Helper: tarjeta de usuario ───
const userCardHTML = (user) => {
    const user_data = JSON.parse(localStorage.getItem('user') || '{}');
    const permissions = user_data.permissions?.map(p => p.code) || [];
    const canUpdate = permissions.includes('users.update');
    const canDelete = permissions.includes('users.delete');
    return `
        <div class="user-card" data-id="${user.id}">
            <div class="user-card-main">
                <div class="user-avatar">
                    <span>${user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div class="user-info">
                    <h3 class="user-name">${user.name}</h3>
                    <p class="user-email">${user.email}</p>
                </div>
            </div>
            <div class="user-card-meta">
                <div class="user-meta-item">
                    <span class="meta-label">ID</span>
                    <span class="meta-value">#${user.id}</span>
                </div>
                <div class="user-meta-item">
                    <span class="meta-label">Documento</span>
                    <span class="meta-value" data-document="${user.document || ''}">${user.document || 'N/A'}</span>
                </div>
                <div class="user-meta-item user-meta-roles">
                    <span class="meta-label">Roles</span>
                    <div class="meta-value roles-container">${renderUserRoles(user)}</div>
                </div>
            </div>
            <div class="user-card-actions">
                <button class="btn-user-action btn-edit" data-id="${user.id}" ${!canUpdate ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>Asignar Roles</button>
                <button class="btn-user-action btn-delete" data-id="${user.id}" ${!canDelete ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>Eliminar</button>
            </div>
        </div>
    `;
};

// ==========================================
// LISTA DE USUARIOS
// ==========================================
export const renderUsersList = async (container) => {
    container.innerHTML = usersView();

    document.getElementById('btn-create-user')?.addEventListener('click', () => {
        window.location.hash = '#/users/create';
    });

    const listContainer = document.getElementById('users-list');

    try {
        const users = await fetchUsers();
        if (!users || users.length === 0) {
            listContainer.innerHTML = `
                <div class="users-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <p>No hay usuarios registrados</p>
                </div>
            `;
        } else {
            listContainer.innerHTML = users.map(user => userCardHTML(user)).join('');
        }

                //  Implementar buscador de usuarios
        const searchInput = document.getElementById('users-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const cards = document.querySelectorAll('.user-card');
                
                cards.forEach(card => {
                    const name = card.querySelector('.user-name')?.textContent.toLowerCase() || '';
                    const email = card.querySelector('.user-email')?.textContent.toLowerCase() || '';
                    const doc = card.querySelector('[data-document]')?.getAttribute('data-document')?.toLowerCase() || '';
                    
                    const matches = name.includes(query) || email.includes(query) || doc.includes(query);
                    card.style.display = matches ? '' : 'none';
                });

                // Mostrar mensaje si no hay resultados
                const visibleCards = Array.from(cards).filter(c => c.style.display !== 'none');
                if (visibleCards.length === 0 && query.length > 0) {
                    if (!document.getElementById('no-results-msg')) {
                        const noResultsMsg = document.createElement('div');
                        noResultsMsg.id = 'no-results-msg';
                        noResultsMsg.className = 'users-empty';
                        noResultsMsg.innerHTML = '<p>No se encontraron usuarios</p>';
                        listContainer.appendChild(noResultsMsg);
                    }
                } else {
                    document.getElementById('no-results-msg')?.remove();
                }
            });
        }

        // Delegación de eventos
        listContainer.addEventListener('click', async (e) => {
            const btnEdit = e.target.closest('.btn-edit');
            const btnDelete = e.target.closest('.btn-delete');

            if (btnEdit) {
                const id = btnEdit.getAttribute('data-id');
                window.location.hash = `#/users/${id}/assign-roles`;
            }

            if (btnDelete) {
                const id = btnDelete.getAttribute('data-id');
                const result = await showConfirmation(
                    '¿Estás seguro?', 
                    'Esta acción no se puede deshacer'
                );

                if (result.isConfirmed) {
                    try {
                        const res = await deleteUser(id);
                        if (res.success) {
                            showToast('Usuario eliminado', 'success');
                            renderUsersList(container); 
                        } else {
                            showAlert('error', res.message || 'Error al eliminar', 'Error');
                        }
                    } catch (error) {
                        showAlert('error', 'Error de red: ' + error.message, 'Fallo de conexión');
                    }
                }
            }
        });

    } catch (error) {
        listContainer.innerHTML = `<div class="users-empty error"><p>Error: ${error.message}</p></div>`;
    }
};

// ==========================================
// CREAR USUARIO
// ==========================================
export const renderCreateUser = async (container) => {
    let roles = [];
    try {
        roles = await fetchRoles();
    } catch (e) {
        console.warn('No se pudieron cargar los roles:', e);
    }

    container.innerHTML = userCreateView(roles);

    // Toggle visibilidad de contraseña
    const toggleButtons = document.querySelectorAll('.btn-toggle-password');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                btn.classList.toggle('active');
            }
        });
    });

    document.getElementById('btn-back-users')?.addEventListener('click', () => { 
        window.location.hash = '#/users'; 
    });

    const form = document.getElementById('create-user-form');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

                // VALIDACIONES
        const name = form.name.value.trim();
        const document = form.document.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        // Validar campos vacíos
        if (!name || !document || !email || !password || !confirmPassword) {
            showAlert('error', 'Todos los campos son requeridos', 'Validación');
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert('error', 'Correo electrónico inválido', 'Validación');
            return;
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            showAlert('error', 'La contraseña debe tener mínimo 6 caracteres', 'Validación');
            return;
        }

        // Validar que coincidan
        if (password !== confirmPassword) {
            showAlert('error', 'Las contraseñas no coinciden', 'Error de validación');
            return;
        }

        // Validar documento
        if (document.length < 6) {
            showAlert('error', 'El documento debe tener mínimo 6 caracteres', 'Validación');
            return;
        }

        // Validar nombre
        if (name.length < 3) {
            showAlert('error', 'El nombre debe tener mínimo 3 caracteres', 'Validación');
            return;
        }

        const btnSubmit = form.querySelector('button[type="submit"]');
        const originalBtnText = btnSubmit.textContent;
        btnSubmit.textContent = 'Guardando...';
        btnSubmit.disabled = true;

        const userData = {
            name: name,  //(usar variables ya validadas)
            document: document,
            email: email,
            password: password,
            roleIds: getSelectedRoleIds('create')
        };

        try {
            const response = await createUser(userData);
            if (response.success) {
                showToast('Usuario creado con éxito', 'success');
                window.location.hash = '#/users'; 
            } else {
                showAlert('error', response.message || 'Error al guardar el usuario', 'Error de registro');
                btnSubmit.textContent = originalBtnText;
                btnSubmit.disabled = false;
            }
        } catch (error) {
            showAlert('error', 'Error de red: ' + error.message, 'Fallo de conexión');
            btnSubmit.textContent = originalBtnText;
            btnSubmit.disabled = false;
        }
    });
};

// ==========================================
// ASIGNAR ROLES
// ==========================================
export const renderAssignRoles = async (container, params) => {
    const userId = params?.id;
    if (!userId) {
        container.innerHTML = `<div class="error-message"><h2>Error: ID no proporcionado.</h2></div>`;
        return;
    }

    container.innerHTML = `<div class="text-center" style="padding: 40px; color: var(--text-secondary);">Cargando datos...</div>`;

    try {
        const [userResponse, roles] = await Promise.all([
            fetchUserById(userId),
            fetchRoles().catch(() => [])
        ]);


        // El backend devuelve data como Array(1), tomamos el primer elemento
        let userData = userResponse?.data;
        if (Array.isArray(userData) && userData.length > 0) {
            userData = userData[0];
        } else if (!userData && typeof userResponse === 'object') {
            userData = userResponse;
        }

        if (!userData || !userData.id) {
            container.innerHTML = `<div class="error-message"><h2>Usuario no encontrado</h2></div>`;
            return;
        }

        // Cargar roles actuales del usuario
        let currentRoleIds = [];
        try {
            const userRoles = await fetchUserRoles(userId);
            currentRoleIds = userRoles.map(r => Number(r.id || r.roleId || r));
        } catch (e) {
            console.warn('[renderAssignRoles] No se pudieron cargar roles desde API:', e);
            // Fallback: extraer de userData
            if (userData.roles && Array.isArray(userData.roles)) {
                currentRoleIds = userData.roles.map(r => Number(r.id || r));
            } else if (userData.roleId) {
                currentRoleIds = [Number(userData.roleId)];
            }
        }


        container.innerHTML = userAssignRolesView(userData, roles);
        setSelectedRoles('assign', currentRoleIds);

        document.getElementById('btn-back-users')?.addEventListener('click', () => {
            window.location.hash = '#/users';
        });

        const form = document.getElementById('assign-roles-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const btnSubmit = form.querySelector('button[type="submit"]');
                const originalText = btnSubmit.textContent;
                btnSubmit.textContent = 'Guardando...';
                btnSubmit.disabled = true;

                const roleIds = getSelectedRoleIds('assign');

                if (roleIds.length === 0) {
                    const confirmed = await showConfirmation(
                        '¿Continuar sin roles?',
                        'Este usuario no tendrá roles asignados en el sistema'
                    );
                    if (!confirmed.isConfirmed) {
                        btnSubmit.textContent = originalText;
                        btnSubmit.disabled = false;
                        return;
                    }
                }

                try {
                    const response = await assignUserRoles(userId, roleIds);
                    if (response.success) {
                        showToast('Roles asignados con éxito', 'success');
                        window.location.hash = '#/users';
                    } else {
                        showAlert('error', response.message || 'Error al asignar roles', 'Error');
                        btnSubmit.textContent = originalText;
                        btnSubmit.disabled = false;
                    }
                } catch (error) {
                    console.error('[renderAssignRoles] Error:', error);
                    showAlert('error', error.message || 'Ocurrió un error inesperado al asignar roles', 'Fallo del sistema');
                    btnSubmit.textContent = originalText;
                    btnSubmit.disabled = false;
                }
            });
        }

    } catch (error) {
        console.error('[renderAssignRoles] Error general:', error);
        container.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
    }
};