// ===============================================================
// ADMIN.JS - COORDINADOR DE EVENTOS
// Este archivo SOLO contiene:
// - Selectores del DOM
// - Event listeners (addEventListener)
// - Llamadas a services (lógica de negocio)
// - Llamadas a funciones de ui (renderizado)
// ===============================================================

// ===============================================================
// IMPORTACIONES
// ===============================================================

// API - Solo llamadas HTTP
import { fetchTasks, deleteTaskApi, updateTaskApi, createTask } from "./api/tasksApi.js";
import { fetchUsers, deleteUserApi, updateUserApi, createUserApi } from "./api/usersApi.js";

// Services - Lógica de negocio
import {
    applyAdminTaskFilters,
    applyAdminUserFilters,
    updateTaskInArray,
    removeTaskFromArray,
    updateUserInArray,
    removeUserFromArray,
    prepareMultipleTasks,
    validateAreaForm,
    validateUserForm
} from "./services/adminService.js";

// UI - Renderizado y manipulación del DOM
import { showNotification } from "./ui/notificationsUI.js";
import { uiEditTask, repaintTask } from "./ui/tasksUI.js";
import { hideEmpty, showEmpty } from "./ui/uiState.js";
import {
    showCustomConfirm,
    renderAdminTasksTable,
    renderAdminUsersTable,
    renderAssigneeCheckboxes
} from "./ui/adminUI.js";

// Utils - Funciones reutilizables
import { formatFecha, getCurrentTimestamp } from "./utils/helpers.js";

// ===============================================================
// SELECTORES DEL DOM
// ===============================================================

// Pestañas y secciones
const tabTasks = document.getElementById("tabTasks");
const tabUsers = document.getElementById("tabUsers");
const tasksSection = document.getElementById("tasksSection");
const usersSection = document.getElementById("usersSection");

// Elementos de usuario y navegación
const btnAdminLogout = document.getElementById("btnAdminLogout");
const nameDisplay = document.getElementById("userNameDisplay");
const emailDisplay = document.getElementById("userEmailDisplay");
const userRolDisplay = document.getElementById("userRolDisplay");
const body = document.querySelector("body");

// Formulario de tareas
const taskTable = document.getElementById("task-table")
const formCard = document.querySelector(".form-card");
const taskTitleArea = document.getElementById("taskTitleArea");
const taskDescriptionArea = document.getElementById("taskDescriptionArea");
const taskStatusArea = document.getElementById("taskStatusArea");
const taskTitleError = document.getElementById("taskTitleError");
const taskDescriptionError = document.getElementById("taskDescriptionError");
const taskStatusError = document.getElementById("taskStatusError");
const userSelectionError = document.getElementById("userSelectionError");
const modalContent = document.querySelector('.modal-content');
const assignUserContainer = document.querySelector('.assing-user');
const submitButton = document.querySelector(".btn--primary");

// Filtros de tareas
const adminSearchTask = document.getElementById("adminSearchTask");
const adminFilterStatus = document.getElementById("adminFilterStatus");

// Modal de creación/edición de tareas globales
const btnNewGlobalTask = document.getElementById("btnNewGlobalTask");
const modalNewGlobalTask = document.getElementById("modalNewGlobalTask");
const btnCancelGlobalTask = document.getElementById("btnCancelGlobalTask");
const formNewGlobalTask = document.getElementById("formNewGlobalTask");
const taskSection = document.getElementById("task-section");

// Filtros de usuarios
const adminSearchUser = document.getElementById("adminSearchUser");

// Modal de usuario
const modalAdminUser = document.querySelector("#modalUserForm")
const btnNewUser = document.getElementById("btnNewUser");
const modalUserForm = document.getElementById("modalUserForm");
const btnCancelUser = document.getElementById("btnCancelUser");
const formUser = document.getElementById("formUser");
const userModalTitle = document.getElementById("userModalTitle");
const editUserId = document.getElementById("editUserId");
const userNameInput = document.getElementById("userName");
const userEmailInput = document.getElementById("userEmail");
const userDocInput = document.getElementById("userDoc");
const userRoleInput = document.getElementById("userRole");

// Estado global
let currentUser = null;
let allTasks = [];
let allUsers = [];

// ===============================================================
// INICIALIZACIÓN DEL DOCUMENTO
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
        await loadAdminData();

        showNotification(`¡Hola de nuevo, ${currentUser.name}!`, "success");

        nameDisplay.textContent = currentUser.name;
        emailDisplay.textContent = currentUser.email;
        userRolDisplay.textContent = "Administrador";

    } catch (error) {
        showNotification("Usuario no encontrado en la base de datos.", "error");
        console.log("Se ha presentado un error: " + error);
    }
});

// ===============================================================
// FUNCIONES DE CARGA DE DATOS
// ===============================================================

/**
 * Carga todos los datos iniciales del admin (tareas y usuarios).
 */
async function loadAdminData() {
    try {
        // Mostrar estado de carga
        adminTasksTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">Cargando datos del sistema...</td></tr>`;

        // Traer datos de la base de datos
        allTasks = await fetchTasks();
        allUsers = await fetchUsers();

        // Dibujar ambas tablas
        renderAdminTasksTable(allTasks, allUsers);
        renderAdminUsersTable(allUsers, allTasks);
    } catch (error) {
        console.error("Error cargando datos del admin:", error);
        adminTasksTableBody.innerHTML = `<tr><td colspan="6" class="table-empty" style="color: red;">Error al cargar la base de datos.</td></tr>`;
    }
}

// ===============================================================
// EVENTOS DE PESTAÑAS Y NAVEGACIÓN
// ===============================================================

/*
    VISUALIZAR LA TABLA DE TAREAS
*/
tabTasks.addEventListener("click", () => {
    tasksSection.classList.remove("hidden");
    usersSection.classList.add("hidden");

    tabTasks.className = "btn btn--primary";
    tabTasks.style.backgroundColor = "";
    tabTasks.style.color = "";

    tabUsers.style.backgroundColor = "var(--color-gray-200)";
    tabUsers.style.color = "var(--color-text-primary)";
});

/*
    VISUALIZAR LA TABLA DE USUARIOS
*/
tabUsers.addEventListener("click", () => {
    usersSection.classList.remove("hidden");
    tasksSection.classList.add("hidden");

    tabUsers.className = "btn btn--primary";
    tabUsers.style.backgroundColor = "";
    tabUsers.style.color = "";

    // tabTasks.className = "btn";
    tabTasks.style.backgroundColor = "var(--color-gray-200)";
    tabTasks.style.color = "var(--color-text-primary)";
});

/*
    CERRAR SESION
*/
btnAdminLogout.addEventListener("click", () => {
    showCustomConfirm(
        "Cerrar Sesión",
        "¿Estás seguro de cerrar sesión?",
        () => {
            localStorage.removeItem('usuarioActivo');
            showNotification("Sesión cerrada correctamente.", "info");
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        }
    );
});

// ===============================================================
// EVENTOS DE FILTROS DE TAREAS
// ===============================================================

/*
    APLICAR FILTRO EN LA TABLA DE TAREAS
*/
adminSearchTask.addEventListener("input", () => {
    const filteredTasks = applyAdminTaskFilters(allTasks, allUsers, adminSearchTask.value, adminFilterStatus.value);
    renderAdminTasksTable(filteredTasks, allUsers);
});

/*
    APLICAR FILTRO EN LA TABLA DE USUARIOS
*/
adminFilterStatus.addEventListener("change", () => {
    const filteredTasks = applyAdminTaskFilters(allTasks, allUsers, adminSearchTask.value, adminFilterStatus.value);
    renderAdminTasksTable(filteredTasks, allUsers);
});

// ===============================================================
// EVENTOS DE ACCIONES EN LA TABLA DE TAREAS (ELIMINAR || BORRAR)
// ===============================================================

const adminTasksTableBody = document.getElementById("adminTasksTableBody");

adminTasksTableBody.addEventListener("click", async (e) => {
    /*
    ACCION: ELIMINAR TAREA
    */
    const btnDelete = e.target.closest(".btn-delete-task");
    if (btnDelete) {
        body.classList.add("no-scroll");
        const taskId = btnDelete.getAttribute("data-id");
        const taskToDelete = allTasks.find(t => String(t.id) === String(taskId));

        if (!taskToDelete) return;

        const userName = getUserNameById(taskToDelete.user_id);

        showCustomConfirm(
            "Eliminar Tarea",
            `¿Estás seguro de que deseas eliminar la tarea de ${userName}? \nEsta acción borrará todos sus datos del sistema.`,
            async () => {
                try {
                    await deleteTaskApi(taskToDelete.id);

                    // Elimina la tarea del array local de tareas
                    allTasks = removeTaskFromArray(allTasks, taskToDelete.id);

                    // Renderiza la informacion actual
                    applyAdminFiltersAndRender();
                    renderAdminUsersTable(allUsers, allTasks);

                    body.classList.remove("no-scroll");
                    showNotification("Tarea borrada con éxito", "success");
                } catch (error) {
                    console.error("Error al eliminar la tarea:", error);
                    alert("No se pudo eliminar la tarea. Intenta de nuevo.");
                }
            }
        );
    }

    /*
    ACCION: ABRIR MODAL DE EDICION TAREA
    */
    const btnEdit = e.target.closest(".btn-edit-task");
    if (btnEdit) {
        const taskId = btnEdit.getAttribute("data-id");
        const taskToEdit = allTasks.find(task => String(task.id) === String(taskId));

        if (!taskToEdit) return;

        try {
            taskSection.classList.remove("hidden");
            body.classList.add("no-scroll");
            setTimeout(() => {
                modalContent.scrollTop = 0;
            }, 0);

            uiEditTask(formCard, taskToEdit);
        } catch (error) {
            console.error("Error al editar:", error);
            showNotification("Hubo un error al intentar buscar la tarea.", "error");
        }
    }
});

// ===============================================================
// EVENTOS DEL MODAL DE CREACIÓN/EDICIÓN DE TAREAS GLOBALES
// ===============================================================
/*
    ACCION: ABRIR MODAL DE CREACION DE TAREAS GLOBALES
*/
btnNewGlobalTask.addEventListener("click", () => {
    taskSection.classList.remove("hidden");
    body.classList.add("no-scroll");

    showEmpty(assignUserContainer);
    delete taskSection.dataset.id;
    formNewGlobalTask.reset();

    renderAssigneeCheckboxes(fetchUsers);

    setTimeout(() => {
        modalContent.scrollTop = 0;
    }, 0);
});

/*
    ACCION: CERRAR MODAL DE CREACION DE TAREAS
*/
btnCancelGlobalTask.addEventListener("click", () => {
    taskSection.classList.add("hidden");
    body.classList.remove("no-scroll");

    formNewGlobalTask.reset();
    hideEmpty(taskTitleError);
    hideEmpty(taskDescriptionError);
    hideEmpty(taskStatusError);
    hideEmpty(userSelectionError);

    formCard.removeAttribute("data-id");
});

/*
    CASOS: EDICION || CREACION DE TAREA
*/
formNewGlobalTask.addEventListener("submit", async (e) => {
    e.preventDefault();

    const taskId = formCard.dataset.id;

    // Validacion total del formulario
    if (!validateAreaForm(taskTable, taskId)) {
        return
    }

    // =================================
    // CASO: EDICIÓN DE TAREA
    // =================================
    if (taskId) {
        showCustomConfirm("Editar tarea", "¿Estas seguro de que deseas editar esta tarea?", async () => {

            const newTaskUpdate = {
                title: taskTitleArea.value,
                description: taskDescriptionArea.value,
                status: taskStatusArea.value
            };

            try {
                await updateTaskApi(taskId, newTaskUpdate);
                allTasks = updateTaskInArray(allTasks, taskId, newTaskUpdate);

                const taskToEdit = allTasks.find(t => String(t.id) === String(taskId));
                repaintTask(taskToEdit, newTaskUpdate);

                showNotification("Tarea actualizada con éxito", "success");
                applyAdminFiltersAndRender();

                taskSection.classList.add("hidden");
                body.classList.remove("no-scroll");
                formCard.removeAttribute("data-id");
                hideEmpty(userSelectionError);
            } catch (error) {
                console.log("[ERROR]", error.message);
                showNotification("Error al actualizar la tarea", "error");
            }
        });
        return;
    }

    // =================================
    // CASO: CREACIÓN DE TAREA MÚLTIPLE
    // =================================

    // Obtener IDs de usuarios seleccionados
    const selectedIds = Array.from(document.querySelectorAll('.user-assign-check:checked')).map(cb => cb.value);

    try {
        // Preparar tareas para cada usuario seleccionado
        const tasksToCreate = prepareMultipleTasks(
            taskTitleArea.value,
            taskDescriptionArea.value,
            taskStatusArea.value,
            getCurrentTimestamp(),
            "admin",
            selectedIds
        );

        // Crear todas las tareas en paralelo
        const creationPromises = tasksToCreate.map(task => createTask(task));
        const responsesFromApi = await Promise.all(creationPromises);

        // Actualizar lista local con las tareas creadas
        responsesFromApi.forEach(res => {
            if (res.data) {
                allTasks.unshift(res.data);
            }
        });

        // Actualizar UI
        applyAdminFiltersAndRender();
        renderAdminUsersTable(allUsers, allTasks);

        taskSection.classList.add("hidden");
        body.classList.remove("no-scroll");
        formNewGlobalTask.reset();

        showNotification(selectedIds.length === 1 ? "Tarea asignada" : "Tareas asignadas", "success");

    } catch (error) {
        console.error("Error al crear tareas múltiples:", error);
        showNotification("Hubo un error al asignar las tareas", "error");
    }
});

// ===============================================================
// EVENTOS DE FILTROS DE USUARIOS
// ===============================================================

/*
    ACCION: FILTRA ACTIVAMENTE LA TABLA DE USUARIOS
*/
adminSearchUser.addEventListener("input", () => {
    const filteredUsers = applyAdminUserFilters(allUsers, adminSearchUser.value);
    renderAdminUsersTable(filteredUsers, allTasks);
});

// ===============================================================
// EVENTOS DE ACCIONES EN LA TABLA DE USUARIOS (ELIMINAR | EDITAR)
// ===============================================================

const adminUsersTableBody = document.getElementById("adminUsersTableBody");

adminUsersTableBody.addEventListener("click", (e) => {
    /*
        CASO: ELIMINAR USUARIO
    */
    const btnDelete = e.target.closest(".btn-delete-user");
    if (btnDelete) {
        body.classList.add("no-scroll");
        const userId = btnDelete.getAttribute("data-id");
        const user = allUsers.find(u => String(u.id) === String(userId));

        if (!user) return;

        showCustomConfirm(
            "Eliminar Usuario",
            `¿Estás seguro de que deseas eliminar a ${user.name}? \nEsta acción borrará todos sus datos del sistema.`,
            async () => {
                try {
                    await deleteUserApi(userId);
                    allUsers = removeUserFromArray(allUsers, userId);
                    applyUserFiltersAndRender();
                    body.classList.remove("no-scroll");
                    showNotification("¡Usuario eliminado con exito!", "success");
                } catch (error) {
                    console.error("Error al eliminar usuario:", error);
                    showNotification("Hubo un error al eliminar el usuario", "error");
                }
            }
        );
    }

    /*
        CASO: EDITAR USUARIO
    */
    const btnEdit = e.target.closest(".btn-edit-user");
    if (btnEdit) {
        body.classList.add("no-scroll");
        const userId = btnEdit.getAttribute("data-id");
        const user = allUsers.find(u => String(u.id) === String(userId));

        // Áreas de error
        const errorName = document.querySelector("#userNameError");
        const errorEmail = document.querySelector("#userEmailError");
        const errorDocument = document.querySelector("#userDocumentError");
        const errorRole = document.querySelector("#userRoleError");

        // Ocultar todos los errores al inicio
        errorName.classList.add("hidden");
        errorEmail.classList.add("hidden");
        errorDocument.classList.add("hidden");
        errorRole.classList.add("hidden");

        if (user) {
            editUserId.value = user.id;
            userNameInput.value = user.name;
            userEmailInput.value = user.email;
            userDocInput.value = user.document;
            userRoleInput.value = user.role || "user";

            userModalTitle.textContent = "Editar Usuario";
            modalUserForm.classList.remove("hidden");
        }
    }
});

// ===============================================================
// EVENTOS DEL MODAL DE USUARIO
// ===============================================================
/*
    ACCION: MOSTRAR MODAL DE CREACION DE USUARIO
*/
btnNewUser.addEventListener("click", async () => {
    // Áreas de error
    const errorName = document.querySelector("#userNameError");
    const errorEmail = document.querySelector("#userEmailError");
    const errorDocument = document.querySelector("#userDocumentError");
    const errorRole = document.querySelector("#userRoleError");

    // Ocultar todos los errores al inicio
    errorName.classList.add("hidden");
    errorEmail.classList.add("hidden");
    errorDocument.classList.add("hidden");
    errorRole.classList.add("hidden");

    formUser.reset();
    editUserId.value = "";
    userModalTitle.textContent = "Nuevo Usuario";
    modalUserForm.classList.remove("hidden");
    body.classList.add("no-scroll");
});

/*
    ACCION: OCULTAR MODAL DE CREACION DE USUARIO
*/
btnCancelUser.addEventListener("click", () => {
    modalUserForm.classList.add("hidden");
    body.classList.remove("no-scroll");
});

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

    const isValid = await validateUserForm(modalAdminUser);

    if (!isValid) {
        return;
    }
    try {
        /*
            CASO: EDICION DE DATOS DE USUARIO
        */
        if (isEditing) {
            showCustomConfirm(
                "Editar usuario",
                `¿Seguro que quieres actualizar los datos de ${userData.name}?`,
                async () => {
                    try {
                        await updateUserApi(userId, userData);

                        allUsers = updateUserInArray(allUsers, userId, userData);

                        showNotification("Usuario actualizado correctamente", "success");
                        body.classList.remove("no-scroll");

                        applyUserFiltersAndRender();
                        modalUserForm.classList.add("hidden");
                        formUser.reset();
                    } catch (error) {
                        console.error("Error al actualizar usuario:", error);
                        showNotification("Error al actualizar usuario", "error");
                    }
                }
            );
            return;
        }

        /*
            CASO: CREACION DE NUEVO USUARIO
        */

        const response = await createUserApi(userData);
        const newUser = response.data;

        allUsers.push(newUser);
        showNotification("Usuario creado correctamente", "success");
        body.classList.remove("no-scroll");

        applyUserFiltersAndRender();
        modalUserForm.classList.add("hidden");
        formUser.reset();

    } catch (error) {
        console.error("Error en la operación de usuario:", error);
        showNotification("Hubo un error al procesar la solicitud", "error");
    }
});

// ===============================================================
// FUNCIONES AUXILIARES DEL COORDINADOR
// ===============================================================

/**
 * Aplica los filtros actuales de tareas y renderiza la tabla.
 */
function applyAdminFiltersAndRender() {
    const filteredTasks = applyAdminTaskFilters(allTasks, allUsers, adminSearchTask.value, adminFilterStatus.value);
    renderAdminTasksTable(filteredTasks, allUsers);
}

/**
 * Aplica los filtros actuales de usuarios y renderiza la tabla.
 */
function applyUserFiltersAndRender() {
    const filteredUsers = applyAdminUserFilters(allUsers, adminSearchUser.value);
    renderAdminUsersTable(filteredUsers, allTasks);
}

/**
 * Obtiene el nombre de un usuario por su ID.
 * @param {string|number} userId - ID del usuario
 * @returns {string} Nombre del usuario
 */
function getUserNameById(userId) {
    const user = allUsers.find(u => String(u.id) === String(userId));
    return user ? user.name : "este usuario";
}