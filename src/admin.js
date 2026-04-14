import { fetchTasks, deleteTaskApi, updateTaskApi, createTask } from "./api/tasksApi.js";
import { fetchUsers, deleteUserApi, updateUserApi, createUserApi } from "./api/usersApi.js";
import { validateForm } from "./services/tasksService.js";
import { showNotification } from "./ui/notificationsUI.js";
import { repaintTask, uiEditTask } from "./ui/tasksUI.js";
import { hideEmpty, showEmpty } from "./ui/uiState.js";
import { formatFecha, getCurrentTimestamp } from "./utils/helpers.js";

// ===============================================================
// 1. SELECTORES DEL DOM
// ===============================================================
const tabTasks = document.getElementById("tabTasks");
const tabUsers = document.getElementById("tabUsers");
const tasksSection = document.getElementById("tasksSection");
const usersSection = document.getElementById("usersSection");
const btnAdminLogout = document.getElementById("btnAdminLogout");
const adminTasksTableBody = document.getElementById("adminTasksTableBody");

const container = document.getElementById("messagesContainer");
const nameDisplay = document.getElementById("userNameDisplay");
const emailDisplay = document.getElementById("userEmailDisplay");
const userRolDisplay = document.getElementById("userRolDisplay");
const body = document.querySelector("body");

// form de tareas
const formCard = document.querySelector(".form-card")
const taskTitleArea = document.getElementById("taskTitleArea");
const taskDescriptionArea = document.getElementById("taskDescriptionArea");
const taskStatusArea = document.getElementById("taskStatusArea");
const taskTitleError = document.getElementById("taskTitleError")
const taskDescriptionError = document.getElementById("taskDescriptionError")
const taskStatusError = document.getElementById("taskStatusError")
const userSelectionError = document.getElementById("userSelectionError");
const modalContent = document.querySelector('.modal-content');
const assignUserContainer = document.querySelector('.assing-user');
const submitButton = document.querySelector(".btn--primary")

let currentUser = null;
let allTasks = [];
let allUsers = [];
// ===============================================================
// INICIALIZACION DEL DOCUMENTO
// ===============================================================
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const sessionData = localStorage.getItem('usuarioActivo');

        if (sessionData) {
            currentUser = JSON.parse(sessionData);
        } else {
            window.location.href = 'index.html';
            return;
        }

        // Carga inicial de datos
        await loadAdminTasks();

        showNotification(`¡Hola de nuevo, ${currentUser.name}!`, "success");

        nameDisplay.textContent = currentUser.name;
        emailDisplay.textContent = currentUser.email;
        userRolDisplay.textContent = "Administrador";

    } catch (error) {
        showNotification("Usuario no encontrado en la base de datos.", "error");
        console.log("Se ha presentado un error: " + error)
    }
});


// ===============================================================
// 2. LÓGICA DE PESTAÑAS Y NAVEGACIÓN
// ===============================================================
tabTasks.addEventListener("click", () => {
    tasksSection.classList.remove("hidden");
    usersSection.classList.add("hidden");

    tabTasks.className = "btn btn--primary";
    tabTasks.style.backgroundColor = "";
    tabTasks.style.color = "";

    tabUsers.className = "btn";
    tabUsers.style.backgroundColor = "var(--color-gray-200)";
    tabUsers.style.color = "var(--color-text-primary)";
});

tabUsers.addEventListener("click", () => {
    usersSection.classList.remove("hidden");
    tasksSection.classList.add("hidden");

    tabUsers.className = "btn btn--primary";
    tabUsers.style.backgroundColor = "";
    tabUsers.style.color = "";

    tabTasks.className = "btn";
    tabTasks.style.backgroundColor = "var(--color-gray-200)";
    tabTasks.style.color = "var(--color-text-primary)";
});

btnAdminLogout.addEventListener("click", () => {
    showCustomConfirm(
        "Cerrar Sesión",
        "¿Estás seguro de cerrar sesión?",
        () => {
            // Eliminar usuario activo
            localStorage.removeItem('usuarioActivo');

            // Notificar
            showNotification("Sesión cerrada correctamente.", "info");

            // Redireccionar al login
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        }
    );
});

// ===============================================================
// 3. LÓGICA DE DATOS Y FILTROS (TAREAS)
// ===============================================================
// 3.1. Nuevos selectores para los filtros
const adminSearchTask = document.getElementById("adminSearchTask");
const adminFilterStatus = document.getElementById("adminFilterStatus");

/**
 * Función exclusiva para DIBUJAR la tabla basándose en una lista de tareas
 * @param {Array} tasksToRender - Lista de tareas que queremos mostrar
 */
function renderAdminTasksTable(tasksToRender) {
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

/**
 * Función principal que carga los datos desde la API
 */
async function loadAdminTasks() {
    try {
        adminTasksTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">Cargando datos del sistema...</td></tr>`;

        // Traer datos de la base de datos
        allTasks = await fetchTasks();
        allUsers = await fetchUsers();

        // Dibujar ambas tablas
        renderAdminTasksTable(allTasks);
        renderAdminUsersTable(allUsers);

    } catch (error) {
        console.error("Error cargando datos del admin:", error);
        adminTasksTableBody.innerHTML = `<tr><td colspan="6" class="table-empty" style="color: red;">Error al cargar la base de datos. Verifica que json-server esté corriendo.</td></tr>`;
    }
}

/**
 * 3.2. Función que evalúa los filtros y actualiza la tabla
 */
function applyAdminFilters() {
    // Aseguramos que el buscador tenga un valor, si no, cadena vacía
    const searchTerm = (adminSearchTask.value || "").toLowerCase();
    const statusValue = adminFilterStatus.value;

    const filteredTasks = allTasks.filter(task => {
        // 1. Validar estado (comprobamos 'estado' o 'status' por si acaso)
        const currentStatus = task.estado || task.status || "";
        const matchStatus = statusValue === "all" || currentStatus === statusValue;

        // 2. Buscar al usuario
        const taskUser = allUsers.find(u => String(u.id) === String(task.user_id));
        const userName = taskUser ? (taskUser.name || "").toLowerCase() : "";

        // 3. Validar descripción (buscamos en ambas posibles llaves para evitar el undefined)
        const desc = (task.descripcion || task.description || "").toLowerCase();
        const title = (task.title || "").toLowerCase();

        const matchSearch = desc.includes(searchTerm) ||
            title.includes(searchTerm) ||
            userName.includes(searchTerm) ||
            String(task.id).includes(searchTerm);

        return matchStatus && matchSearch;
    });

    renderAdminTasksTable(filteredTasks);
}

// 3.3. Escuchar los eventos de la barra de herramientas
adminSearchTask.addEventListener("input", applyAdminFilters); // Se activa al escribir cada letra
adminFilterStatus.addEventListener("change", applyAdminFilters); // Se activa al cambiar el select

// ===============================================================
// 4. LÓGICA DE ACCIONES EN LA TABLA (ELIMINAR Y EDITAR)
// ===============================================================
adminTasksTableBody.addEventListener("click", async (e) => {

    // -----------------------------------------
    // ACCIÓN: ELIMINAR TAREA
    // -----------------------------------------
    const btnDelete = e.target.closest(".btn-delete-task");
    if (btnDelete) {
        // bloquear el scroll de fondo
        body.classList.add("no-scroll");

        const taskId = btnDelete.getAttribute("data-id");

        // Buscamos a la tarea
        const actuallyTask = allTasks.find(j => String(j.id) === String(taskId))

        // Buscamos el nombre para que el mensaje sea personalizado
        const actuallyUser = allUsers.find(u => String(u.id) === String(actuallyTask.user_id));
        const userName = actuallyUser ? actuallyUser.name : "este usuario";

        showCustomConfirm(
            "Eliminar Tarea",
            `¿Estás seguro de que deseas eliminar la tarea de ${userName}? Esta acción borrará todos sus datos del sistema.`,
            async () => {
                try {
                    // 1. Llamada a la API
                    await deleteTaskApi(actuallyTask.id);

                    // 2. Actualizar lista local
                    allTasks = allTasks.filter(m => String(m.id) !== String(actuallyTask.id));

                    // 3. Redibujar tabla
                    applyAdminFilters();

                    body.classList.remove("no-scroll");
                    showNotification("Tarea borrada con éxito", "success");

                    renderAdminUsersTable(allUsers);
                } catch (error) {
                    console.error("Error al eliminar la tarea:", error);
                    alert("No se pudo eliminar al usuario. Intenta de nuevo.");
                }
            }
        )
    };

    // -----------------------------------------
    // ACCIÓN: EDITAR TAREA
    // -----------------------------------------
    const btnEdit = e.target.closest(".btn-edit-task");
    if (btnEdit) {
        try {
            const taskId = btnEdit.getAttribute("data-id");

            // 1. Buscamos la tarea actual en nuestra lista para saber qué decía antes
            const taskToEdit = allTasks.find(task => String(task.id) === String(taskId));
            if (!taskToEdit) return;

            // 2. Muestra el modal
            taskSection.classList.remove("hidden");
            body.classList.add("no-scroll");

            setTimeout(() => {
                modalContent.scrollTop = 0;
            }, 0);

            // Preparar la card para editar
            uiEditTask(formCard, taskToEdit);

        } catch (error) {
            console.error("Error al editar:", error);
            showNotification("Hubo un error al intentar buscar la tarea.", "error");
        }
    }
});


// ===============================================================
// 5. LÓGICA DEL MODAL: CREAR TAREA GLOBAL & EDICION DE TAREA
// ===============================================================
const btnNewGlobalTask = document.getElementById("btnNewGlobalTask");
const modalNewGlobalTask = document.getElementById("modalNewGlobalTask");
const btnCancelGlobalTask = document.getElementById("btnCancelGlobalTask");
const formNewGlobalTask = document.getElementById("formNewGlobalTask");

const globalTaskUser = document.getElementById("globalTaskUser");
const globalTaskDesc = document.getElementById("globalTaskDesc");
const taskSection = document.getElementById("task-section")

// 5.1. Abrir Modal y llenar la lista de usuarios
btnNewGlobalTask.addEventListener("click", () => {
    taskSection.classList.remove("hidden");
    body.classList.add("no-scroll");


    showEmpty(assignUserContainer);

    delete taskSection.dataset.id;

    formNewGlobalTask.reset();

    renderAssigneeCheckboxes();
    setTimeout(() => {
        modalContent.scrollTop = 0;
    }, 0);
});

// 5.2. Cerrar Modal
btnCancelGlobalTask.addEventListener("click", () => {

    hideEmpty(userSelectionError)
    taskSection.classList.add("hidden");
    body.classList.remove("no-scroll");

    formNewGlobalTask.reset(); // Limpiar el formulario

    hideEmpty(taskTitleError);
    hideEmpty(taskDescriptionError);
    hideEmpty(taskStatusError);
    hideEmpty(userSelectionError);

    formCard.removeAttribute("data-id");
});

// 5.3. Guardar la nueva tarea (Múltiples usuarios) & Editar tarea
formNewGlobalTask.addEventListener("submit", async (e) => {
    e.preventDefault();

    // =================================
    // CONFIRMACION DE EDICION DE TAREA
    // =================================

    // Se busca si el form contiene un data-id
    const taskId = formCard.dataset.id;

    // Si contiene un data-id procede a editar
    if (taskId) {
        showCustomConfirm("Editar tarea", "¿Estas seguro de que deseas editar esta tarea?", async () => {

            const taskToEdit = allTasks.find(task => String(task.id) === String(taskId));

            if (!validateForm(taskTitleArea, taskDescriptionArea, taskStatusArea, taskTitleError, taskDescriptionError, taskStatusError)) {
                return;
            }

            let newTaskUpdate = {
                title: taskTitleArea.value,
                description: taskDescriptionArea.value,
                status: taskStatusArea.value
            };

            // API
            await updateTaskApi(taskId, newTaskUpdate);

            // Usamos Object.assign o el spread operator para no perder el userId original
            const index = allTasks.findIndex(t => String(t.id) === String(taskId));
            if (index !== -1) {
                allTasks[index] = { ...allTasks[index], ...newTaskUpdate };
            }

            // UI
            repaintTask(taskToEdit, newTaskUpdate);

            showNotification("Tarea actualizada con éxito", "success");
            applyAdminFilters();

            // cerrar modal
            taskSection.classList.add("hidden");
            body.classList.remove("no-scroll");
            formCard.removeAttribute("data-id");
            hideEmpty(userSelectionError);
            return
        });
        return
    }

    // Variable para validar que todos los campos no esten vacios
    var canMake = true;

    // Obtener IDs de usuarios seleccionados
    const selectedIds = Array.from(document.querySelectorAll('.user-assign-check:checked')).map(cb => cb.value);

    if (selectedIds.length === 0) {
        showEmpty(userSelectionError)
        canMake = false;
    } else {
        hideEmpty(userSelectionError)
    }

    // Validar campos de texto
    if (!validateForm(taskTitleArea, taskDescriptionArea, taskStatusArea, taskTitleError, taskDescriptionError, taskStatusError)) {
        canMake = false;
    }

    // Si algun campo esta vacio, bloquea la accion de crear
    if (!canMake) {
        return;
    }

    // Datos base de la tarea
    const baseTask = {
        title: taskTitleArea.value.trim(),
        description: taskDescriptionArea.value.trim(),
        status: taskStatusArea.value,
        createdAt: getCurrentTimestamp(),
        created_by: "admin"
    };

    try {
        // 4. Crear una tarea para cada usuario seleccionado
        const creationPromises = selectedIds.map(user_id => {
            return createTask({ ...baseTask, user_id });
        });

        // Esperamos a que todas se guarden en la API
        const responsesFromApi = await Promise.all(creationPromises);

        // 5. Actualizar la lista local (opcional, para ver cambios sin recargar)
        responsesFromApi.forEach(res => {
            if (res.data) {
                allTasks.unshift(res.data);
            }
        });

        // 6. Limpiar, cerrar y notificar
        applyAdminFilters();

        renderAdminUsersTable(allUsers);
        taskSection.classList.add("hidden");
        body.classList.remove("no-scroll");
        formNewGlobalTask.reset();

        showNotification(selectedIds.length === 1 ? "Tarea asignada" : "Tareas asignadas", "success");

        // Actializar el contador de tareas asignadas a cada usuario
        renderAdminUsersTable(allUsers);

    } catch (error) {
        console.error("Error al crear tareas múltiples:", error);
        showNotification("Hubo un error al asignar las tareas", "error");
    }
});


// ===============================================================
// 6. LÓGICA DE DATOS Y FILTROS (USUARIOS)
// ===============================================================
const adminUsersTableBody = document.getElementById("adminUsersTableBody");
const adminSearchUser = document.getElementById("adminSearchUser");

/**
 * Dibuja la tabla de usuarios en pantalla
 */
async function renderAdminUsersTable(usersToRender) {
    adminUsersTableBody.innerHTML = "";

    if (!usersToRender || usersToRender.length === 0) {
        adminUsersTableBody.innerHTML = `<tr><td colspan="5" class="table-empty">No se encontraron usuarios.</td></tr>`;
        return;
    }

    const allTasks = await fetchTasks()

    usersToRender.forEach(user => {
        // Definir un color según el rol (Azul para admin, Verde para usuario)
        const roleColor = user.role === "admin" ? "var(--color-primary)" : "var(--color-success)";
        const roleText = user.role === "admin" ? "Administrador" : "Usuario";

        // Guardamos las tareas de este usuario
        const userTasks = allTasks.filter(task => Number(task.userId) === Number(user.id));

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

/**
 * Filtra la tabla de usuarios en tiempo real
 */
function applyUserFilters() {
    if (!allUsers) allUsers = [];

    const searchTerm = (adminSearchUser.value || "").toLowerCase();

    const filteredUsers = allUsers.filter(user => {
        const name = (user.name || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        const docId = String(user.document || user.id || "").toLowerCase();

        return name.includes(searchTerm) ||
            docId.includes(searchTerm) ||
            email.includes(searchTerm);
    });

    renderAdminUsersTable(filteredUsers);
}

// Activar el buscador de usuarios cuando se escriba
adminSearchUser.addEventListener("input", applyUserFilters);

// ===============================================================
// 7. MODAL DE CONFIRMACIÓN Y ELIMINAR USUARIO
// ===============================================================

// Selectores del nuevo modal
const modalConfirm = document.getElementById("modalConfirm");
const btnAcceptConfirm = document.getElementById("btnAcceptConfirm");
const btnCancelConfirm = document.getElementById("btnCancelConfirm");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");

let confirmAction = null; // Variable temporal para guardar qué función ejecutar

/**
 * Función genérica para mostrar el modal de confirmación
 */
function showCustomConfirm(title, message, onAccept) {
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

// ESCUCHAR CLICS EN LA TABLA DE USUARIOS
adminUsersTableBody.addEventListener("click", (e) => {

    // CASO: ELIMINAR USUARIO
    const btnDelete = e.target.closest(".btn-delete-user");
    if (btnDelete) {
        body.classList.add("no-scroll");
        const userId = btnDelete.getAttribute("data-id");

        // Buscamos el nombre para que el mensaje sea personalizado
        const user = allUsers.find(u => String(u.id) === String(userId));
        if (!user) return;

        // Abrimos el modal personalizado pasándole la lógica de borrado
        showCustomConfirm(
            "Eliminar Usuario",
            `¿Estás seguro de que deseas eliminar a ${user.name}? Esta acción borrará todos sus datos del sistema.`,
            async () => {
                try {
                    // 1. Llamada a la API
                    await deleteUserApi(userId);

                    // 2. Actualizar lista local
                    allUsers = allUsers.filter(u => String(u.id) !== String(userId));

                    // 3. Redibujar tabla
                    applyUserFilters();

                    showNotification("¡Usuario eliminado con exito!", "success")
                    body.classList.remove("no-scroll");
                } catch (error) {
                    console.error("Error al eliminar usuario:", error);
                    alert("No se pudo eliminar al usuario. Intenta de nuevo.");
                }
            }
        );
    }
});

// ===============================================================
// 8. LÓGICA DE CREAR Y EDITAR USUARIOS
// ===============================================================
const btnNewUser = document.getElementById("btnNewUser");
const modalUserForm = document.getElementById("modalUserForm");
const btnCancelUser = document.getElementById("btnCancelUser");
const formUser = document.getElementById("formUser");
const userModalTitle = document.getElementById("userModalTitle");

// Campos del formulario
const editUserId = document.getElementById("editUserId");
const userNameInput = document.getElementById("userName");
const userEmailInput = document.getElementById("userEmail");
const userDocInput = document.getElementById("userDoc");
const userRoleInput = document.getElementById("userRole");

// 8.1. Abrir para NUEVO usuario
btnNewUser.addEventListener("click", () => {
    formUser.reset();
    editUserId.value = ""; // Importante: vacío para saber que es creación
    userModalTitle.textContent = "Nuevo Usuario";
    modalUserForm.classList.remove("hidden");
    body.classList.add("no-scroll");
});

// 8.2. Abrir para EDITAR usuario (Desde la tabla)
adminUsersTableBody.addEventListener("click", (e) => {
    const btnEdit = e.target.closest(".btn-edit-user");
    if (btnEdit) {
        body.classList.add("no-scroll");
        const userId = btnEdit.getAttribute("data-id");
        const user = allUsers.find(u => String(u.id) === String(userId));

        if (user) {
            editUserId.value = user.id;
            userNameInput.value = user.name;
            userEmailInput.value = user.email;
            userDocInput.value = user.document || user.id;
            userRoleInput.value = user.role || "user";

            userModalTitle.textContent = "Editar Usuario";
            modalUserForm.classList.remove("hidden");
        }
    }
});

// Cerrar modal
btnCancelUser.addEventListener("click", () => {
    modalUserForm.classList.add("hidden")
    body.classList.remove("no-scroll");
});

// 8.3. GUARDAR (Crear o Actualizar)
formUser.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userData = {
        name: userNameInput.value.trim(),
        email: userEmailInput.value.trim(),
        document: userDocInput.value.trim(),
        role: userRoleInput.value
    };

    const userId = editUserId.value;
    const isEditing = userId !== "";

    try {
        if (isEditing) {
            showCustomConfirm(
                "Editar usuario",
                `¿Seguro que quieres actualizar los datos de ${userData.name}?`,
                async () => {

                    await updateUserApi(userId, userData);

                    // Actualizar en el array local (allUsers)
                    const index = allUsers.findIndex(u => String(u.id) === String(userId));
                    if (index !== -1) {
                        allUsers[index] = { ...allUsers[index], ...userData };
                    }

                    showNotification("Usuario actualizado correctamente", "success");
                    body.classList.remove("no-scroll");

                    // Acciones comunes
                    applyUserFilters();
                    modalUserForm.classList.add("hidden");
                    formUser.reset();
                }
            );

            return;
        }

        // --- LÓGICA DE CREACIÓN ---
        const response = await createUserApi(userData);

        const newUser = response.data; 

        allUsers.push(newUser);
    showNotification("Usuario creado correctamente", "success");
        body.classList.remove("no-scroll");

        // Acciones comunes
        applyUserFilters();
        modalUserForm.classList.add("hidden");
        formUser.reset();

    } catch (error) {
        console.error("Error en la operación de usuario:", error);
        showNotification("Hubo un error al procesar la solicitud", "error");
    }
});

// Funcion de checkbox
async function renderAssigneeCheckboxes() {
    try {
        const users = await fetchUsers();
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