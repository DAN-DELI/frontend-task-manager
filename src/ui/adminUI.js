// ---------------------------------------------------------------
// UI DE ADMINISTRACIÓN (DOM)
// Contiene funciones para renderizar tablas y modales del panel admin
// ---------------------------------------------------------------

import { formatFecha } from "../utils/helpers.js";

// ===============================================================
// SELECTORES DEL DOM (ADMIN)
// ===============================================================
const adminTasksTableBody = document.getElementById("adminTasksTableBody");
const adminUsersTableBody = document.getElementById("adminUsersTableBody");

// ===============================================================
// MODAL DE CONFIRMACIÓN
// ===============================================================
const modalConfirm = document.getElementById("modalConfirm");
const btnAcceptConfirm = document.getElementById("btnAcceptConfirm");
const btnCancelConfirm = document.getElementById("btnCancelConfirm");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");
const body = document.querySelector("body");

let confirmAction = null; // Variable temporal para guardar qué función ejecutar

/**
 * Muestra un modal de confirmación genérico.
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje a mostrar
 * @param {Function} onAccept - Función a ejecutar al aceptar
 */
export function showCustomConfirm(title, message, onAccept) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmAction = onAccept; // Guardamos la función
    modalConfirm.classList.remove("hidden");
}

// Evento para el botón de Cancelar
btnCancelConfirm.addEventListener("click", () => {
    modalConfirm.classList.add("hidden");
    body.classList.remove("no-scroll");
    confirmAction = null;
});

// Evento para el botón de Aceptar (ejecuta la acción guardada)
btnAcceptConfirm.addEventListener("click", async () => {
    if (confirmAction) {
        await confirmAction();
    }
    modalConfirm.classList.add("hidden");
});

// ===============================================================
// TABLA DE TAREAS (ADMIN)
// ===============================================================

/**
 * Renderiza la tabla de tareas del panel de administración.
 * @param {Array} tasksToRender - Lista de tareas a mostrar
 * @param {Array} allUsers - Lista completa de usuarios (para buscar nombres)
 */
export function renderAdminTasksTable(tasksToRender, allUsers) {
    adminTasksTableBody.innerHTML = "";

    if (tasksToRender.length === 0) {
        adminTasksTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">No se encontraron tareas con estos filtros.</td></tr>`;
        return;
    }

    tasksToRender.forEach(task => {
        const taskUser = allUsers.find(u => String(u.id) === String(task.user_id));
        const userName = taskUser ? taskUser.name : "Usuario Desconocido";

        const currentStatus = task.status || task.estado || "pendiente";

        // Definimos el color según el estado real de la DB
        let statusColor;
        if (currentStatus === "completada") {
            statusColor = "var(--color-success)"; // Verde
        } else if (currentStatus === "en-progreso") {
            statusColor = "var(--color-info, #3498db)"; // Azul 
        } else {
            statusColor = "var(--color-warning)"; // Naranja/Amarillo para pendiente
        }

        const fechaFormateada = task.created_at ? formatFecha(task.created_at) : "Sin fecha";

        const tr = document.createElement("tr");
        tr.dataset.id = task.id;
        tr.innerHTML = `
            <td>${userName} <br><small style="color: var(--color-gray-500)">ID: ${task.user_id}</small></td>
            <td><strong>${task.title}</strong></td> 
            <td>${task.description}</td>
            <td>${fechaFormateada}</td>
            <td>
                <span style="background-color: ${statusColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">
                    ${currentStatus}
                </span>
            </td>
            <td>
                <div style="display:flex; flex-direction:column; gap:6px; align-items:stretch;">
                    <button class="btn btn--primary btn-edit-task" data-id="${task.id}" style="padding:5px 10px; font-size:0.8rem; white-space:nowrap;">✏️ Editar</button>
                    <button class="btn btn--danger btn-delete-task" data-id="${task.id}" style="padding:5px 10px; margin-top: 10px;  font-size:0.8rem; white-space:nowrap;">🗑️ Eliminar</button>
                </div>
            </td>
        `;
        adminTasksTableBody.appendChild(tr);
    });
}

// ===============================================================
// TABLA DE USUARIOS (ADMIN)
// ===============================================================

/**
 * Renderiza la tabla de usuarios del panel de administración.
 * @param {Array} usersToRender - Lista de usuarios a mostrar
 * @param {Array} allTasks - Lista completa de tareas (para contar por usuario)
 */
export function renderAdminUsersTable(usersToRender, allTasks) {
    adminUsersTableBody.innerHTML = "";

    if (!usersToRender || usersToRender.length === 0) {
        adminUsersTableBody.innerHTML = `<tr><td colspan="5" class="table-empty">No se encontraron usuarios.</td></tr>`;
        return;
    }

    usersToRender.forEach(user => {
        // Definir un color según el rol (Azul para admin, Verde para usuario)
        const roleColor = user.role === "admin" ? "var(--color-primary)" : "var(--color-success)";
        const roleText = user.role === "admin" ? "Administrador" : "Usuario";

        // Contar tareas de este usuario
        const taskCount = allTasks.filter(t => String(t.user_id) === String(user.id)).length;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${user.document}</strong></td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${taskCount}</td>
            <td>
                <span style="background-color: ${roleColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">
                    ${roleText}
                </span>
            </td>
            <td>
                <div style="display:flex; flex-direction:column; gap:6px; align-items:stretch;">
                    <button class="btn btn--primary btn-edit-user" data-id="${user.id}" style="padding: 5px 10px; font-size: 0.8rem; white-space: nowrap;">✏️ Editar</button>
                    <button class="btn btn--danger btn-delete-user" data-id="${user.id}" style="padding: 5px 10px; margin-top: 10px; font-size: 0.8rem; white-space: nowrap;">🗑️ Eliminar</button>
                </div>
            </td>
        `;
        adminUsersTableBody.appendChild(tr);
    });
}

// ===============================================================
// CHECKBOXES DE ASIGNACIÓN DE USUARIOS
// ===============================================================

/**
 * Renderiza los checkboxes para asignar tareas a múltiples usuarios.
 * @param {Array} users - Lista de usuarios no administradores
 */
export async function renderAssigneeCheckboxes(fetchUsersFn) {
    try {
        const users = await fetchUsersFn();
        const listContainer = document.getElementById('individualUsersList');

        const clientUsers = users.filter(u => u.role !== 'admin');

        listContainer.innerHTML = clientUsers.map(user => `
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
                <input type="checkbox" class="user-assign-check" value="${user.id}">
                <span>${user.name} <small style="color: #777;">(${user.document || user.id})</small></span>
            </label>
        `).join('');

        const selectAllCheck = document.getElementById('selectAllUsers');
        if (selectAllCheck) {
            selectAllCheck.addEventListener('change', (e) => {
                const allIndividualChecks = document.querySelectorAll('.user-assign-check');
                allIndividualChecks.forEach(cb => cb.checked = e.target.checked);
            });
        }
    } catch (error) {
        console.error("Error cargando usuarios:", error);
    }
}