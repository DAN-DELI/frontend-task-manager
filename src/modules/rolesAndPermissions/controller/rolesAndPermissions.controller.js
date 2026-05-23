import { rolesListView, roleCreateView, roleEditView, permissionCardHTML } from '../view/rolesAndPermissions.view.js';
import { fetchRoles, fetchRoleById, createRole, updateRolePartial, deleteRole, fetchRolePermissions, assignRolePermissions } from '../../../api/roles.api.js';
import { fetchPermissions } from '../../../api/permissions.api.js';
import { showToast, showConfirmation, showAlert } from '../../../utils/notification.js';
import { validateRoleEditing, validateRoleCreate } from '../validation/schemaRol.validate.js';
import { addDeleteRol, canDeleteRol } from '../validation/deleteRol.validation.js';
import { navigateTo } from '../../../utils/navigation.js';

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
            rolesTbody.innerHTML = rolesArray.map(role => {
                const isSystemRole = !addDeleteRol(role.name);

                return `
                <tr>
                    <td>${role.id}</td>
                    <td>${role.name}</td>
                    <td>${role.description ?? '—'}</td>
                    <td class="actions-cell">
                        <button class="btn-secondary btn-edit-role ${isSystemRole ? 'view-role' : ''}" data-id="${role.id}">
                        ${isSystemRole ? 'Vista' : 'Editar'}
                        </button>
                        ${isSystemRole
                        ? `<button class="btn-danger btn-delete-role" data-id="${role.id}" style="background-color: #9ca3af; border-color: #9ca3af; opacity: 0.7;">Eliminar</button>`
                        : `<button class="btn-danger btn-delete-role" data-id="${role.id}">Eliminar</button>`
                    }
                    </td>
                </tr>
                `;
            }).join('');
        }

        // ─── Listeners de tabla ───


        rolesTbody.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');


            // Redirigir hash a ver o editar 
            if (e.target.classList.contains('btn-edit-role')) {
                const id = e.target.getAttribute('data-id');

                if (e.target.classList.contains('view-role')) {
                    window.location.hash = `#/rolesAndPermissions/view/${id}`;
                } else {
                    window.location.hash = `#/rolesAndPermissions/edit/${id}`;
                }
            }


            // ==========================================
            //          ACCION: ELIMINAR ROL
            // ==========================================
            const brnDeleteRol = e.target.classList.contains('btn-delete-role')
            if (brnDeleteRol) {

                // Validar que no sean los roles basicos del sistema
                const canDelete = await canDeleteRol(id);
                if (!canDelete) {
                    showAlert('warning', 'Este rol corresponde a un rol base del sistema', 'No puedes eliminar este rol');
                    return;
                };

                // Validar que el rol no este asignado a ningun usuario


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
                        // Si el backend responde 409 significa que el rol está asignado a usuarios
                        if (err?.status === 409) {
                            showAlert(
                                'error',
                                err?.errors ?? 'Este rol no se puede eliminar porque se encuentra asignado a uno o más usuarios.',
                                'Acción no permitida'
                            );
                            return;
                        }

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
//       FUNCION HASH ".../create"
// ==========================================
export const renderCreateRole = async (container) => {

    // RENDERIZAR VISTA DE CREACION DE ROL
    const allPermissions = await fetchPermissions(); // Conseguir todos los roles y permisos
    container.innerHTML = roleEditView("", allPermissions, "", false); // Pintar indicando la modal de creacion

    // ========================================================
    //          EVENTO => REGRESAR A LA VISTA INICIAL
    // ========================================================
    document.getElementById('btn-back-roles')?.addEventListener('click', () => {
        window.location.hash = '#/rolesAndPermissions';
    });


    // ========================================================
    //                 EVENTO => CREAR ROL
    // ========================================================
    const form = document.getElementById('create-role-form');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        // ========================================================
        //                  SELECTORES DEL DOM
        // ========================================================
        const name = document.getElementById('role-name').value.trim();
        const description = document.getElementById('role-description').value.trim();

        // Validar campos
        const isValid = await validateRoleCreate();
        if (!isValid) return;

        const btn = document.getElementById('btn-create-role');
        btn.disabled = true;
        btn.textContent = 'Creando...';

        try {
            // Obtener permisos seleccionados
            const selectedPermissionIds = Array.from(
                document.querySelectorAll('input[name="permissionIds"]:checked')
            ).map(cb => Number(cb.value));

            // Validar la seleccion de al menos un rol
            if (selectedPermissionIds.length === 0) {
                showToast('Debes asignar al menos un permiso al rol', 'error');
                return;
            }

            // Crear rol
            const responseRol = await createRole({ name, description });

            // Asignar permisos seleccionados al rol
            if (!responseRol.success) {
                assignRolePermissions(responseRol.data.id, selectedPermissionIds);
            }


            showToast('Rol creado correctamente', 'success');
            window.location.hash = '#/rolesAndPermissions';
        } catch (err) {
            console.error(err?.message ?? 'Error al crear el rol', 'error');
        } finally {
            // Reactivar botón
            btn.disabled = false;
            btn.textContent = 'Crear Rol';
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

        const roleData = Array.isArray(roleRes) ? roleRes[0] : roleRes?.data ?? roleRes;
        const permissionsArr = Array.isArray(allPermissions) ? allPermissions : allPermissions?.data ?? [];
        const assignedIds = (Array.isArray(rolePermissions) ? rolePermissions : rolePermissions?.data ?? [])
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

            const name = document.getElementById('role-name').value.trim();
            const description = document.getElementById('role-description').value.trim();

            // Validar datos del rol (pasando el ID del rol para excluirlo de la validación de duplicados)
            if (!(await validateRoleEditing(roleId))) return;

            // Obtener permisos seleccionados
            const selectedPermissionIds = Array.from(
                document.querySelectorAll('input[name="permissionIds"]:checked')
            ).map(cb => Number(cb.value));

            const btn = document.getElementById('btn-save-role');
            btn.disabled = true;
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
                btn.disabled = false;
                btn.textContent = 'Guardar cambios';
            }
        });

    } catch (err) {
        console.error('[ERROR] renderEditRole:', err);
        container.innerHTML = `<div class="error-message">Error: ${err?.message ?? 'Error desconocido'}</div>`;
    }
};
