import { usersView, userCreateView, userEditView } from '../view/users.view.js';
import { fetchUsers, createUser, fetchUserById, updateUserPartial, deleteUser, fetchUserRoles } from '../../../api/users.api.js'; 
import { hasPermission } from '../../../utils/index.js';
import { showAlert, showToast, showConfirmation } from '../../../utils/notification.js';

// ─── Roles disponibles ───
const AVAILABLE_ROLES = [
    { id: 1, name: 'Administrador' },
    { id: 2, name: 'Evaluador' },
    { id: 3, name: 'Aprendiz' }
];

const getRoleById = (id) => AVAILABLE_ROLES.find(r => r.id === Number(id));

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

// ─── Helper: renderizar celda de roles en tabla ───
const renderUserRolesCell = (user) => {
    let roles = [];
    
    if (user.roles && Array.isArray(user.roles)) {
        roles = user.roles.map(r => {
            if (typeof r === 'object') return r.name || r.roleName || getRoleById(r.id)?.name || 'Desconocido';
            if (typeof r === 'string') return r;
            if (typeof r === 'number') return getRoleById(r)?.name || 'Desconocido';
            return 'Desconocido';
        });
    } else if (user.role?.name) {
        roles = [user.role.name];
    } else if (user.rol?.name) {
        roles = [user.rol.name];
    } else if (user.roleId) {
        const role = getRoleById(user.roleId);
        if (role) roles = [role.name];
    }
    
    if (roles.length === 0) return '<span class="role-badge role-sin-rol">Sin rol</span>';
    
    return roles.map(name => {
        const cssClass = `role-${name.toLowerCase().replace(/\s+/g, "-")}`;
        return `<span class="role-badge ${cssClass}">${name}</span>`;
    }).join(' ');
};

// ==========================================
// LISTA DE USUARIOS
// ==========================================
export const renderUsersList = async (container) => {
    if (!hasPermission('users.view')) {
        container.innerHTML = `<div class="access-denied"><h2>Acceso Denegado</h2></div>`;
        return;
    }

    const canCreate = hasPermission('users.create');
    container.innerHTML = usersView(canCreate);
    
    if (canCreate) {
        document.getElementById('btn-create-user')?.addEventListener('click', () => {
            window.location.hash = '#/users/create';
        });
    }

    const tbody = document.getElementById('users-table-body');
    const canUpdate = hasPermission('users.update');
    const canDelete = hasPermission('users.delete');

    try {
        const users = await fetchUsers();
        if (!users || users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color: var(--text-muted);">No hay usuarios registrados.</td></tr>`;
        } else {
            tbody.innerHTML = users.map(user => {
                let actionButtons = '';
                if (canUpdate) actionButtons += `<button class="btn-secondary btn-edit" data-id="${user.id}">Editar</button> `;
                if (canDelete) actionButtons += `<button class="btn-danger btn-delete" data-id="${user.id}">Eliminar</button>`;
                if (!canUpdate && !canDelete) actionButtons = '<span style="color: var(--text-muted);">Sin acciones</span>';

                return `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.document || 'N/A'}</td>
                        <td>${renderUserRolesCell(user)}</td>
                        <td class="actions-cell">${actionButtons}</td>
                    </tr>
                `;
            }).join('');
        }

        tbody.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-edit')) {
                const id = e.target.getAttribute('data-id');
                window.location.hash = `#/users/edit/${id}`;
            }

            if (e.target.classList.contains('btn-delete')) {
                const id = e.target.getAttribute('data-id');
                const result = await showConfirmation(
                    '¿Estás seguro?', 
                    'Esta acción no se puede deshacer'
                );

                if (result.isConfirmed) {
                    try {
                        const res = await deleteUser(id);
                        if (res.success) {
                            showToast('Usuario eliminado');
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
        tbody.innerHTML = `<tr><td colspan="6" class="error-message text-center">Error: ${error.message}</td></tr>`;
    }
};

// ==========================================
// CREAR USUARIO
// ==========================================
export const renderCreateUser = (container) => {
    if (!hasPermission('users.create')) {
        container.innerHTML = `<div class="access-denied"><h2>Acceso Denegado</h2><p>No tienes permiso para crear usuarios.</p></div>`;
        return;
    }

    container.innerHTML = userCreateView();
    
    document.getElementById('btn-back-users')?.addEventListener('click', () => { 
        window.location.hash = '#/users'; 
    });

    const form = document.getElementById('create-user-form');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = form.querySelector('button[type="submit"]');
        const originalBtnText = btnSubmit.textContent;
        btnSubmit.textContent = 'Guardando...';
        btnSubmit.disabled = true;
        
        const userData = {
            name: form.name.value,
            document: form.document.value,
            email: form.email.value,
            password: form.password.value,
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
// EDITAR USUARIO
// ==========================================
export const renderEditUser = async (container, params) => {
    if (!hasPermission('users.update')) {
        container.innerHTML = `<div class="access-denied"><h2>Acceso Denegado</h2></div>`;
        return;
    }

    const userId = params?.id;
    if (!userId) {
        container.innerHTML = `<div class="error-message"><h2>Error: ID no proporcionado.</h2></div>`;
        return;
    }

    container.innerHTML = `<div class="text-center" style="padding: 40px; color: var(--text-secondary);">Cargando datos...</div>`;

    try {
        const user = await fetchUserById(userId);
        const userData = user?.data || user;

        if (!userData || !userData.id) {
            container.innerHTML = `<div class="error-message"><h2>Usuario no encontrado</h2></div>`;
            return;
        }

        container.innerHTML = userEditView(userData);

        document.getElementById('btn-back-users')?.addEventListener('click', () => {
            window.location.hash = '#/users';
        });

        // ─── Precargar roles actuales ───
        let currentRoleIds = [];
        if (userData.roles && Array.isArray(userData.roles)) {
            currentRoleIds = userData.roles.map(r => Number(r.id || r));
        } else if (userData.roleId) {
            currentRoleIds = [Number(userData.roleId)];
        } else {
            try {
                const rolesFromApi = await fetchUserRoles(userId);
                currentRoleIds = rolesFromApi.map(r => Number(r.id || r.roleId || r));
            } catch (e) {
                console.warn('No se pudieron cargar los roles desde API', e);
            }
        }
        setSelectedRoles('edit', currentRoleIds);

        const form = document.getElementById('edit-user-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const btnSubmit = form.querySelector('button[type="submit"]');
                const originalText = btnSubmit.textContent;
                btnSubmit.textContent = 'Actualizando...';
                btnSubmit.disabled = true;

                const updatedData = {
                    name: document.getElementById('edit-name').value.trim(),
                    document: document.getElementById('edit-document').value.trim(),
                    email: document.getElementById('edit-email').value.trim(),
                    roleIds: getSelectedRoleIds('edit')
                };

                try {
                    const response = await updateUserPartial(userId, updatedData);
                    if (response.success || response) {
                        showToast('Usuario actualizado con éxito', 'success');
                        window.location.hash = '#/users';
                    } else {
                        showAlert('error', response.message || 'Error al actualizar', 'Error de edición');
                        btnSubmit.textContent = originalText;
                        btnSubmit.disabled = false;
                    }
                } catch (error) {
                    showAlert('error', 'Ocurrió un error inesperado al actualizar', 'Fallo del sistema');
                    btnSubmit.textContent = originalText;
                    btnSubmit.disabled = false;
                }
            });
        }

    } catch (error) {
        container.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
    }
};