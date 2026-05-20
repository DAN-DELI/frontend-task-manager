export const usersView = (canCreate = false) => {
    return `
        <div class="dashboard-container">
            <header class="view-header">
                <h1 class="view-title">Gestión de Usuarios</h1>
                ${canCreate ? '<button id="btn-create-user" class="btn-primary" style="width: auto; padding: 10px 20px;">Crear Usuario</button>' : ''}
            </header>
            
            <div class="content-card">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Documento</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body">
                            <tr>
                                <td colspan="6" style="text-align: center; color: var(--text-muted);">Cargando usuarios...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

export const userCreateView = () => {
    return `
        <div class="dashboard-container">
            <header class="view-header">
                <h1 class="view-title">Crear Nuevo Usuario</h1>
                <button id="btn-back-users" class="btn-secondary">Volver a la lista</button>
            </header>
            
            <div class="content-card" style="max-width: 500px; margin: 0 auto;">
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

                    <div class="input-group" style="margin-bottom: 10px;">
                        <label for="user-role">Rol del sistema</label>
                        <div class="input-wrapper">
                            <select id="user-role" name="roleId" required>
                                <option value="" disabled selected>Seleccione un rol...</option>
                                <option value="1">Administrador</option>
                                <option value="2">Evaluador</option>
                                <option value="3">Aprendiz</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" class="btn-primary">Guardar Usuario</button>
                </form>
            </div>
        </div>
    `;
};

export const userEditView = (user) => {
    return `
        <div class="dashboard-container">
            <header class="view-header">
                <h1 class="view-title">Editar Usuario</h1>
                <button id="btn-back-users" class="btn-secondary">Volver a la lista</button>
            </header>
            
            <div class="content-card auth-card" style="max-width: 600px; margin: 0 auto;">
                <form id="edit-user-form" class="auth-form">
                    <input type="hidden" id="edit-user-id" value="${user.id}">
                    
                    <div class="input-group">
                        <label for="edit-name">Nombre completo</label>
                        <div class="input-wrapper">
                            <input type="text" id="edit-name" name="name" value="${user.name || ''}" required>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="edit-document">Documento</label>
                        <div class="input-wrapper">
                            <input type="text" id="edit-document" name="document" value="${user.document || ''}" required>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="edit-email">Correo Electrónico</label>
                        <div class="input-wrapper">
                            <input type="email" id="edit-email" name="email" value="${user.email || ''}" required>
                        </div>
                    </div>
                    
                    <div class="input-group">
                        <label for="edit-role">Rol en el sistema</label>
                        <div class="input-wrapper">
                            <select id="edit-role" name="roleId" required>
                                <option value="1">Administrador</option>
                                <option value="2">Evaluador</option>
                                <option value="3">Aprendiz</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" class="btn-primary" style="margin-top: 16px;">Guardar Cambios</button>
                </form>
            </div>
        </div>
    `;
};