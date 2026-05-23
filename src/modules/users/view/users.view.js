export const usersView = () => {
    return `
        <div class="dashboard-container">
            <header class="view-header">
                <h1 class="view-title">Gestión de Usuarios</h1>
                <button id="btn-create-user" class="btn-primary">Crear Usuario</button>
            </header>

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
                        <label for="user-password">Contraseña</label>
                        <div class="input-wrapper">
                            <input type="password" id="user-password" name="password" placeholder="Mínimo 6 caracteres" required>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="user-confirm-password">Confirmar contraseña</label>
                        <div class="input-wrapper">
                            <input type="password" id="user-confirm-password" name="confirmPassword" placeholder="Repita la contraseña" required>
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