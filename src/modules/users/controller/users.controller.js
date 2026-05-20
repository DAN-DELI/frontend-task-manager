import { usersView, userCreateView, userEditView } from '../view/users.view.js';
import { fetchUsers, createUser, fetchUserById, updateUserPartial, deleteUser } from '../../../api/users.api.js'; 
import { hasPermission } from '../../../utils/index.js';
import { showAlert, showToast, showConfirmation } from '../../../utils/notification.js';
// Helper para extraer el nombre del rol del usuario
const getRoleName = (user) => {
    if (user.role?.name) return user.role.name;
    if (user.rol?.name) return user.rol.name;
    if (user.role?.roleName) return user.role.roleName;
    if (user.rol?.roleName) return user.rol.roleName;
    // Mapa de IDs a nombres de rol como fallback
    const roleMap = { 1: 'Administrador', 2: 'Evaluador', 3: 'Aprendiz' };
    return roleMap[user.roleId] || roleMap[user.role] || roleMap[user.rol] || 'Sin rol';
};



// ==========================================
// CONTROLADOR DE LA LISTA DE USUARIOS
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
                        <td><span class="role-badge role-${(getRoleName(user).toLowerCase().replace(/\s+/g, "-"))}">${getRoleName(user)}</span></td>
                        <td class="actions-cell">${actionButtons}</td>
                    </tr>
                `;
            }).join('');
        }

        // DELEGACIÓN DE EVENTOS EN LA TABLA
        tbody.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-edit')) {
                const id = e.target.getAttribute('data-id');
                window.location.hash = `#/users/edit/${id}`;
            }

            if (e.target.classList.contains('btn-delete')) {
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
                            showAlert(res.message || 'Error al eliminar');
                        }
                    } catch (error) {
                        alert('Error de red: ' + error.message);
                    }
                }
            }
        });

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="error-message text-center">Error: ${error.message}</td></tr>`;
    }
};

// ==========================================
// CONTROLADOR DE CREACIÓN DE USUARIO
// ==========================================
export const renderCreateUser = (container) => {
    if (!hasPermission('users.create')) {
        container.innerHTML = `<div class="access-denied"><h2>Acceso Denegado</h2><p>No tienes permiso para crear usuarios.</p></div>`;
        return;
    }

    container.innerHTML = userCreateView();
    document.getElementById('btn-back-users')?.addEventListener('click', () => { window.location.hash = '#/users'; });

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
            roleId: Number(form.roleId.value)
        };

        try {
            const response = await createUser(userData);
            if (response.success) {
                showToast('Usuario creado con éxito', 'success'); // <-- Toast de éxito
                window.location.hash = '#/users'; 
            } else {
                // Usamos showAlert en lugar de alert
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
// CONTROLADOR DE EDICIÓN DE USUARIO
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

    container.innerHTML = `<div class="text-center">Cargando datos...</div>`;

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

        const roleSelect = document.getElementById('edit-role');
        if (roleSelect) {
            const currentRoleId = userData.roleId || userData.role?.id || userData.rol?.id;
            if (currentRoleId) roleSelect.value = currentRoleId;
        }

        const form = document.getElementById('edit-user-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault(); // <-- ESTO EVITA QUE LA PÁGINA SE RECARGUE AL DAR CLICK EN GUARDAR
                
                const btnSubmit = form.querySelector('button[type="submit"]');
                const originalText = btnSubmit.textContent;
                btnSubmit.textContent = 'Actualizando...';
                btnSubmit.disabled = true;

                const updatedData = {
                    name: document.getElementById('edit-name').value.trim(),
                    document: document.getElementById('edit-document').value.trim(),
                    email: document.getElementById('edit-email').value.trim(),
                    roleId: Number(document.getElementById('edit-role').value)
                };

                try {
                    const response = await updateUserPartial(userId, updatedData);
                    if (response.success || response) {
                        showToast('Usuario actualizado con éxito', 'success');
                        window.location.hash = '#/users';
                    } else {
                        showAlert('error', response.message || 'Error al actualizar', 'Error de edición');
                        // ... restaurar botón
                    }
                } catch (error) {
                    showAlert('error', 'Ocurrió un error inesperado al actualizar', 'Fallo del sistema');
                    // ... restaurar botón
                }
            });
        }

    } catch (error) {
        container.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
    }
};