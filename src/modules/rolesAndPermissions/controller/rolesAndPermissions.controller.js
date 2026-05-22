import { rolesListView, roleCreateView, roleEditView, permissionCardHTML } from '../view/rolesAndPermissions.view.js';
import { fetchRoles, fetchRoleById, createRole, updateRolePartial, deleteRole, fetchRolePermissions, assignRolePermissions } from '../../../api/roles.api.js';
import { fetchPermissions } from '../../../api/permissions.api.js';
import { showToast, showConfirmation } from '../../../utils/notification.js';

// ─── Helper: mostrar/ocultar error de campo ───
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

// ─── Helper: validar formulario de rol ───
const validateRoleForm = (name) => {
    let valid = true;
    setFieldError('role-name-error');
    if (!name || name.trim().length < 2) {
        setFieldError('role-name-error', 'El nombre debe tener al menos 2 caracteres');
        valid = false;
    }
    return valid;
};

// ==========================================
// LISTA DE ROLES + PERMISOS
// ==========================================
export const renderRolesList = async (container) => {
    container.innerHTML = rolesListView();

    // Botón crear rol
    document.getElementById('btn-create-role')?.addEventListener('click', () => {
        window.location.hash = '#/rolesAndPermissions/create';
    });

    const rolesTbody = document.getElementById('roles-table-body');
    const permissionsGrid = document.getElementById('permissions-grid');

    try {
        // Cargar roles y permisos en paralelo
        const [roles, permissions] = await Promise.all([
            fetchRoles(),
            fetchPermissions()
        ]);

        // ─── Renderizar tabla de roles ───
        const rolesArray = Array.isArray(roles) ? roles : roles?.data ?? [];

        if (rolesArray.length === 0) {
            rolesTbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-muted);">
                        No hay roles registrados.
                    </td>
                </tr>`;
        } else {
            rolesTbody.innerHTML = rolesArray.map(role => `
                <tr>
                    <td>${role.id}</td>
                    <td>${role.name}</td>
                    <td>${role.description ?? '—'}</td>
                    <td class="actions-cell">
                        <button class="btn-secondary btn-edit-role" data-id="${role.id}">Editar</button>
                        <button class="btn-danger btn-delete-role" data-id="${role.id}">Eliminar</button>
                    </td>
                </tr>
            `).join('');
        }

        // ─── Listeners de tabla ───
        rolesTbody.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');

            if (e.target.classList.contains('btn-edit-role')) {
                window.location.hash = `#/rolesAndPermissions/edit/${id}`;
            }

            if (e.target.classList.contains('btn-delete-role')) {
                const result = await showConfirmation(
                    '¿Eliminar rol?',
                    'Esta acción no se puede deshacer'
                );
                if (result.isConfirmed) {
                    try {
                        await deleteRole(id);
                        showToast('Rol eliminado correctamente', 'success');
                        renderRolesList(container);
                    } catch (err) {
                        showToast(err?.message ?? 'Error al eliminar el rol', 'error');
                    }
                }
            }
        });

        // ─── Renderizar permisos ───
        const permissionsArray = Array.isArray(permissions) ? permissions : permissions?.data ?? [];

        if (permissionsArray.length === 0) {
            permissionsGrid.innerHTML = `<p style="color: var(--text-muted);">No hay permisos registrados.</p>`;
        } else {
            permissionsGrid.innerHTML = permissionsArray.map(p => permissionCardHTML(p)).join('');
        }

    } catch (err) {
        console.error('[ERROR] renderRolesList:', err);
        rolesTbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center;" class="error-message">
                    Error al cargar los roles: ${err?.message ?? 'Error desconocido'}
                </td>
            </tr>`;
    }
};

// ==========================================
// CREAR ROL
// ==========================================
export const renderCreateRole = (container) => {
    container.innerHTML = roleCreateView();

    document.getElementById('btn-back-roles')?.addEventListener('click', () => {
        window.location.hash = '#/rolesAndPermissions';
    });

    const form = document.getElementById('create-role-form');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name        = document.getElementById('role-name').value.trim();
        const description = document.getElementById('role-description').value.trim();

        if (!validateRoleForm(name)) return;

        const btn = document.getElementById('btn-save-role');
        btn.disabled    = true;
        btn.textContent = 'Guardando...';

        try {
            await createRole({ name, description });
            showToast('Rol creado correctamente', 'success');
            window.location.hash = '#/rolesAndPermissions';
        } catch (err) {
            showToast(err?.message ?? 'Error al crear el rol', 'error');
            btn.disabled    = false;
            btn.textContent = 'Guardar Rol';
        }
    });
};

// ==========================================
// EDITAR ROL
// ==========================================
export const renderEditRole = async (container, params) => {
    const roleId = params?.id;

    if (!roleId) {
        container.innerHTML = `<div class="error-message"><h2>Error: ID no proporcionado.</h2></div>`;
        return;
    }

    container.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-muted);">
            Cargando datos del rol...
        </div>`;

    try {
        // Cargar rol, todos los permisos y permisos actuales del rol en paralelo
        const [roleRes, allPermissions, rolePermissions] = await Promise.all([
            fetchRoleById(roleId),
            fetchPermissions(),
            fetchRolePermissions(roleId)
        ]);

        const roleData        = Array.isArray(roleRes) ? roleRes[0] : roleRes?.data ?? roleRes;
        const permissionsArr  = Array.isArray(allPermissions) ? allPermissions : allPermissions?.data ?? [];
        const assignedIds     = (Array.isArray(rolePermissions) ? rolePermissions : rolePermissions?.data ?? [])
                                    .map(p => Number(p.id ?? p.permissionId ?? p));

        if (!roleData?.id) {
            container.innerHTML = `<div class="error-message"><h2>Rol no encontrado.</h2></div>`;
            return;
        }

        container.innerHTML = roleEditView(roleData, permissionsArr, assignedIds);

        document.getElementById('btn-back-roles')?.addEventListener('click', () => {
            window.location.hash = '#/rolesAndPermissions';
        });

        const form = document.getElementById('edit-role-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name        = document.getElementById('role-name').value.trim();
            const description = document.getElementById('role-description').value.trim();

            if (!validateRoleForm(name)) return;

            // Obtener permisos seleccionados
            const selectedPermissionIds = Array.from(
                document.querySelectorAll('input[name="permissionIds"]:checked')
            ).map(cb => Number(cb.value));

            if (selectedPermissionIds.length === 0) {
                showToast('Debes asignar al menos un permiso al rol', 'error');
                return;
            }

            const btn = document.getElementById('btn-save-role');
            btn.disabled    = true;
            btn.textContent = 'Guardando...';

            try {
                // Guardar nombre/descripción y permisos en paralelo
                await Promise.all([
                    updateRolePartial(roleId, { name, description }),
                    assignRolePermissions(roleId, selectedPermissionIds)
                ]);
                showToast('Rol actualizado correctamente', 'success');
                window.location.hash = '#/rolesAndPermissions';
            } catch (err) {
                showToast(err?.message ?? 'Error al actualizar el rol', 'error');
                btn.disabled    = false;
                btn.textContent = 'Guardar cambios';
            }
        });

    } catch (err) {
        console.error('[ERROR] renderEditRole:', err);
        container.innerHTML = `<div class="error-message">Error: ${err?.message ?? 'Error desconocido'}</div>`;
    }
};