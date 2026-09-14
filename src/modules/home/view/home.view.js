import { getAllPermissions } from '../../../api';
import { getUser, getPermissions, hasAnyPermission } from '../../../utils/index';

export const homeView = async () => {
    const user = getUser();
    const name = user?.name || user?.email || 'Usuario';
    const userPermCodes = getPermissions();

    let allPermissions = [];
    try {
        const res = await getAllPermissions();
        allPermissions = Array.isArray(res) ? res : (res.data || []);
    } catch (err) {
        console.error('Error cargando permisos del sistema', err);
    }

    const myPermissions = allPermissions.filter(p => userPermCodes.includes(p.code));

    const functionalPerms = [
        'tasks.view', 'tasks.create', 'tasks.update', 'tasks.delete',
        'users.view', 'users.create', 'users.update', 'users.delete',
        'roles.view', 'roles.create', 'roles.update', 'roles.delete',
        'roles.assign', 'permissions.view', 'user-roles.assign'
    ];

    const hasFunctional = myPermissions.some(p => functionalPerms.includes(p.code));

    // ─── ESTADO 1: Sin permisos funcionales ───
    if (!hasFunctional) {
        return `
            <section class="home-section">
                <div class="home-card">
                    <h2>Bienvenido, ${name}</h2>
                    <p class="home-text">
                        Actualmente no tienes permisos asignados en el sistema para gestionar información.
                    </p>
                    <p class="home-text">
                        Para solicitar acceso a los módulos de trabajo, contacta a tu administrador o superior directo.
                    </p>
                </div>
            </section>
        `;
    }

    // ─── ESTADO 2: Con permisos ───
    const permListHtml = myPermissions.map(p => `
        <li class="perm-item">
            <strong class="perm-name">${p.name}</strong>
            <span class="perm-desc">${p.description}</span>
        </li>
    `).join('');

    return `
        <section class="home-section">
            <h2>Bienvenido, ${name}</h2>
            
            <div class="home-block">
                <h3>Tu acceso actual</h3>
                <ul class="perm-list">
                    ${permListHtml}
                </ul>
            </div>
        </section>
    `;
};