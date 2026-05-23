//          VISTA: ROLES Y PERMISOS

/**
 * Vista principal — lista de roles + catálogo de permisos (solo lectura)
 */
export const rolesListView = () => `
    <div class="dashboard-container">

        <header class="view-header">
            <h1 class="view-title">Roles y Permisos</h1>
            <button id="btn-create-role" class="btn-primary" style="width: auto; padding: 10px 20px;">
                Crear Rol
            </button>
        </header>

        <!-- SECCIÓN: ROLES -->
        <div class="content-card">
            <h2 class="section-title">Gestión de Roles</h2>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="roles-table-body">
                        <tr>
                            <td colspan="4" style="text-align: center; color: var(--text-muted);">
                                Cargando roles...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- SECCIÓN: PERMISOS -->
        <div class="content-card" style="margin-top: 24px;">
            <h2 class="section-title">Permisos del sistema</h2>
            <p class="section-subtitle">Catálogo de permisos disponibles — solo lectura</p>
            <div id="permissions-grid" class="permissions-grid">
                <p style="color: var(--text-muted);">Cargando permisos...</p>
            </div>
        </div>

    </div>
`;

/**
 * Vista formulario — crear rol
 */
export const roleCreateView = () => `
    <div class="dashboard-container">

        <header class="view-header">
            <h1 class="view-title">Crear Rol</h1>
            <button id="btn-back-roles" class="btn-secondary" style="width: auto; padding: 10px 20px;">
                Volver
            </button>
        </header>

        <div class="content-card">
            <form id="create-role-form" class="form-layout">

                <div class="input-group">
                    <label for="role-name">Nombre del rol</label>
                    <div class="input-wrapper">
                        <input type="text" id="role-name" name="name" placeholder="Ej: Supervisor" />
                    </div>
                    <span class="error-message hidden" id="role-name-error"></span>
                </div>

                <div class="input-group">
                    <label for="role-description">Descripción</label>
                    <div class="input-wrapper">
                        <input type="text" id="role-description" name="description" placeholder="Ej: Supervisa el trabajo de los aprendices" />
                    </div>
                    <span class="error-message hidden" id="role-description-error"></span>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-primary" id="btn-save-role" style="width: auto; padding: 10px 24px;">
                        Guardar Rol
                    </button>
                </div>

            </form>
        </div>

    </div>
`;

/**
 * Vista formulario — crear o editar rol
 * @param {{ id?: number, name?: string, description?: string }} [role]
 * @param {Array} permissions - Todos los permisos del sistema
 * @param {number[]} assignedIds - IDs de permisos ya asignados al rol
 * @param {boolean} isEditing - true = editar, false = crear
 */
export const roleEditView = (role, permissions = [], assignedIds = [], isEditing = true) => `
    <div class="dashboard-container">

        <header class="view-header">
            <h1 class="view-title">${isEditing ? 'Editar Rol' : 'Crear Rol'}</h1>
            <button id="btn-back-roles" class="btn-secondary" style="width: auto; padding: 10px 20px;">
                Volver
            </button>
        </header>

        <div class="content-card">
            <form id="${isEditing ? 'edit-role-form' : 'create-role-form'}" class="form-layout">

                <div class="input-group">
                    <label for="role-name">Nombre del rol</label>
                    <div class="input-wrapper">
                        <input type="text" id="role-name" name="name" value="${role.name ?? ''}" placeholder="Nombre del rol" />
                    </div>
                    <span class="error-message hidden" id="role-name-error"></span>
                </div>

                <div class="input-group">
                    <label for="role-description">Descripción</label>
                    <div class="input-wrapper">
                        <input type="text" id="role-description" name="description" value="${role.description ?? ''}" placeholder="Descripción del rol" />
                    </div>
                    <span class="error-message hidden" id="role-description-error"></span>
                </div>

                <div class="input-group">
                    <label>${isEditing ? 'Permisos asignados' : 'Asignar permisos'}</label>
                    <div class="permissions-checklist" id="permissions-checklist">
                        ${permissions.length === 0
        ? '<p style="color: var(--text-muted); font-size: 13px;">No hay permisos disponibles.</p>'
        : permissions.map(p => `
                                <label class="permission-checkbox-item">
                                    <input
                                        type="checkbox"
                                        name="permissionIds"
                                        value="${p.id}"
                                        class="permission-checkbox-input"
                                        ${assignedIds.includes(p.id) ? 'checked' : ''}
                                    />
                                    <div class="permission-checkbox-info">
                                        <span class="permission-code">${p.code ?? ''}</span>
                                        <span class="permission-name">${p.name ?? ''}</span>
                                    </div>
                                </label>
                            `).join('')
    }
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-primary" id="${isEditing ? 'btn-save-role' : 'btn-create-role'}"  style="width: auto; padding: 10px 24px;">
                        ${isEditing ? 'Editar Rol' : 'Crear Rol'}
                    </button>
                </div>

            </form>
        </div>

    </div>
`;

/**
 * Genera el HTML de una tarjeta de permiso
 * @param {{ id: number, code: string, name: string, description: string }} permission
 */
export const permissionCardHTML = (permission) => `
    <div class="permission-card">
        <span class="permission-code">${permission.code ?? ''}</span>
        <p class="permission-name">${permission.name ?? ''}</p>
        <p class="permission-desc">${permission.description ?? ''}</p>
    </div>
`;