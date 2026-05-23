// ==========================================
//     CONTROLADOR DE VISTA DE ROLES
// ==========================================

import { fetchPermissions, fetchRoleById, fetchRolePermissions } from "../../../api";
import { hasPermission } from "../../../utils";
import { roleViewOnly } from "../view/roleViewOnly.view";

export const onlyViewController = async (params) => {
    const container = document.querySelector("#main-content");

    // Validar que el permiso base
    const canView = hasPermission("roles.view")
    if (!canView) {
        container.innerHTML = `<div class="without-permissions"><h2>No cuentas con los permisos suficientes</h2></div>`
        return
    }

    if (!params.id) {
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
            fetchRoleById(params.id),
            fetchPermissions(),
            fetchRolePermissions(params.id)
        ]);

        const roleData = Array.isArray(roleRes) ? roleRes[0] : roleRes?.data ?? roleRes;
        const permissionsArr = Array.isArray(allPermissions) ? allPermissions : allPermissions?.data ?? [];
        const assignedIds = (Array.isArray(rolePermissions) ? rolePermissions : rolePermissions?.data ?? [])
            .map(p => Number(p.id ?? p.permissionId ?? p));

        if (!roleData?.id) {
            container.innerHTML = `<div class="error-message"><h2>Rol no encontrado.</h2></div>`;
            return;
        }

        container.innerHTML = roleViewOnly(roleData, permissionsArr, assignedIds)

        document.getElementById('btn-back-roles')?.addEventListener('click', () => {
            window.location.hash = '#/rolesAndPermissions';
        });


    } catch (err) {
        console.error('[ERROR] onlyViewController:', err);
        container.innerHTML = `<div class="error-message">Error: ${err?.message ?? 'Error desconocido'}</div>`;
    }

}
