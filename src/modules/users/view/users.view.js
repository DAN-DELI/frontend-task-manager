export const usersView = () => {
    return `
        <div class="dashboard-container">
            <header class="view-header">
                <h1 class="view-title">Gestión de Usuarios</h1>
                ${(() => {
                    const u = JSON.parse(localStorage.getItem('user') || '{}');
                    const can = u.permissions?.some(p => p.code === 'users.create');
                    return `<button id="btn-create-user" class="btn-primary" ${!can ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>Crear Usuario</button>`;
                })()}
            </header>

            <!-- Agregar buscador de usuarios -->
            <div class="search-container" style="margin-bottom: 20px;">
                <input 
                    type="text" 
                    id="users-search" 
                    class="search-input" 
                    placeholder="🔍 Buscar por nombre, email o documento..."
                    style="width: 100%; padding: 10px 15px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px;"
                >
            </div>

            <div class="users-list" id="users-list">
                <!-- Los usuarios se inyectan aquí -->
            </div>
        </div>
    `;
};

// ─── Helper: HTML de los checkboxes de roles (dinámico) ───
const rolesChecklistHTML = (contextId, roles = []) => {
    if (!roles.length) {
        return `<p class="input-hint">Cargando roles...</p>`;
    }

    const roleClassMap = {
        'administrador': 'role-administrador',
        'evaluador': 'role-evaluador',
        'aprendiz': 'role-aprendiz'
    };

    const roleDescMap = {
        'administrador': 'Control total del sistema',
        'evaluador': 'Revisa y evalúa tareas y usuarios',
        'aprendiz': 'Acceso básico como estudiante'
    };

    const items = roles.map(role => {
        const cssClass = roleClassMap[role.name?.toLowerCase()] || 'role-sin-rol';
        const desc = role.description || roleDescMap[role.name?.toLowerCase()] || 'Rol del sistema';
        return `
        <label class="role-checkbox-item">
            <input type="checkbox" name="roleIds" value="${role.id}" class="role-checkbox-input">
            <span class="role-checkbox-checkmark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </span>
            <div class="role-checkbox-info">
                <span class="role-badge ${cssClass}">${role.name}</span>
                <small class="role-checkbox-desc">${desc}</small>
            </div>
        </label>
        `;
    }).join('');

    return `
    <div class="roles-checklist-inline" id="roles-checklist-${contextId}">
        ${items}
    </div>
    `;
};

export const userCreateView = (roles = []) => {
    return `
        <div class="dashboard-container">
            <header class="view-header">
                <h1 class="view-title">Crear Nuevo Usuario</h1>
                <button id="btn-back-users" class="btn-secondary">Volver a la lista</button>
            </header>

            <div class="content-card user-form-card">
                <form id="create-user-form" class="auth-form">

                    <div class="input-group">
                        <label for="user-name">Nombre completo</label>
                        <div class="input-wrapper">
                            <input type="text" id="user-name" name="name" placeholder="Ej. Juan Pérez" required>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="user-document">Documento de identidad</label>
                        <div class="input-wrapper">
                            <input type="text" id="user-document" name="document" placeholder="Ej. 123456789" required>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="user-email">Correo Electrónico</label>
                        <div class="input-wrapper">
                            <input type="email" id="user-email" name="email" placeholder="correo@ejemplo.com" required>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="user-password">Contraseña <span style="color: red;">*</span></label>
                        <div class="input-wrapper password-input-wrapper" style="position: relative;">
                            <input type="password" id="user-password" name="password" placeholder="Mínimo 6 caracteres" required>
                            <button type="button" class="btn-toggle-password" data-target="user-password" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 5px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="user-confirm-password">Confirmar contraseña <span style="color: red;">*</span></label>
                        <div class="input-wrapper password-input-wrapper" style="position: relative;">
                            <input type="password" id="user-confirm-password" name="confirmPassword" placeholder="Repita la contraseña" required>
                            <button type="button" class="btn-toggle-password" data-target="user-confirm-password" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 5px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </div>
                        <span class="error-message hidden" id="error-confirm-password"></span>
                    </div>

                    <div class="input-group roles-group">
                        <label>Roles del sistema</label>
                        ${rolesChecklistHTML('create', roles)}
                    </div>

                    <button type="submit" class="btn-primary">Guardar Usuario</button>
                </form>
            </div>
        </div>
    `;
};

export const userAssignRolesView = (user, roles = []) => {
    return `
        <div class="dashboard-container">
            <header class="view-header">
                <h1 class="view-title">Asignar Roles</h1>
                <button id="btn-back-users" class="btn-secondary">Volver a la lista</button>
            </header>

            <div class="content-card auth-card user-edit-card">
                <h2 class="user-name-readonly">${user.name || 'Usuario'}</h2>
                <p class="user-email-readonly">${user.email || ''}</p>

                <form id="assign-roles-form" class="auth-form">
                    <input type="hidden" id="assign-user-id" value="${user.id}">

                    <div class="input-group">
                        <label>Roles en el sistema</label>
                        ${rolesChecklistHTML('assign', roles)}
                    </div>

                    <button type="submit" class="btn-primary mt-16">Guardar Cambios</button>
                </form>
            </div>
        </div>
    `;
};