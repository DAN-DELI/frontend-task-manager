/**
 * Vista formulario — solo lectura (detalle del rol)
 * @param {{ id: number, name: string, description: string }} role
 * @param {Array} permissions - Todos los permisos del sistema
 * @param {number[]} assignedIds - IDs de permisos asignados al rol
 */
export const roleViewOnly = (role, permissions = [], assignedIds = []) => {
    const assignedPermissions = permissions.filter(p => assignedIds.includes(p.id));

    return `
    <div class="dashboard-container">

        <header class="view-header">
            <h1 class="view-title">Detalle del Rol</h1>
            <button id="btn-back-roles" class="btn-secondary" >
                Volver
            </button>
        </header>

        <div class="content-card">
            <div class="form-layout">

                <div class="input-group">
                    <label for="role-name">Nombre del rol</label>
                    <div class="input-wrapper">
                        <div id="role-name">
                            ${role.name ?? ''}
                        </div>
                    </div>
                </div>

                <div class="input-group">
                    <label for="role-description">Descripción</label>
                    <div class="input-wrapper">
                        <div id="role-description">
                            ${role.description ?? ''}
                        </div>
                    </div>
                </div>

                <div class="input-group">
                    <label>Permisos asignados</label>
                    <div class="permissions-checklist" id="permissions-checklist">
                        ${assignedPermissions.length === 0
            ? '<p>Este rol no tiene permisos asignados.</p>'
            : assignedPermissions.map(p => `
                                <label class="permission-checkbox-item">
                                    <input
                                        type="checkbox"
                                        name="permissionIds"
                                        value="${p.id}"
                                        class="permission-checkbox-input"
                                        checked
                                        disabled
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

            </div>
        </div>

    </div>
    `;
};