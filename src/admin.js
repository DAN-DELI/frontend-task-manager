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
    validateUserForm,
    loadAdminData
} from "./services/adminPanel.service.js";

// UI - Renderizado y manipulación del DOM
import { showNotification } from "./ui/notificationsUI.js";
import { repaintTask } from "./ui/tasksUI.js";
import { hideEmpty, showEmpty } from "./ui/uiState.js";
import {
    showCustomConfirm,
    renderAdminTasksTable,
    renderAdminUsersTable,
    renderAssigneeCheckboxes,
    uiEditTask
} from "./ui/adminUI.js";

// Utils - Funciones reutilizables
import { getCurrentTimestamp } from "./utils/helpers.js";
import { getAllUsers, serviceDeleteUser, servicePatchUser, servicePostUser } from "./services/userService.js";
import { getAllTasks, serviceDeleteTask, servicePostTask, serviceUpdateTask } from "./services/tasksService.js";

// ===============================================================
// SELECTORES DEL DOM
// ===============================================================

// Pestañas y secciones
const tabTasks = document.getElementById("tabTasks");
const tabUsers = document.getElementById("tabUsers");
const tasksSection = document.getElementById("tasksSection");
const usersSection = document.getElementById("usersSection");
const adminTasksTableBody = document.getElementById("adminTasksTableBody");

// Elementos de usuario y navegación
const btnAdminLogout = document.getElementById("btnAdminLogout");
const body = document.querySelector("body");

// FORMULARIO DE TAREAS
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

// FORMULARIO DE USUARIOS
// Áreas de errores
const errorName = document.querySelector("#userNameError");
const errorEmail = document.querySelector("#userEmailError");
const errorDocument = document.querySelector("#userDocumentError");
const errorRole = document.querySelector("#userRoleError");

// Filtros de tareas
const adminSearchTask = document.getElementById("adminSearchTask");
const adminFilterStatus = document.getElementById("adminFilterStatus");

// Modal de creación/edición de tareas globales
const btnNewGlobalTask = document.getElementById("btnNewGlobalTask");
const btnCancelGlobalTask = document.getElementById("btnCancelGlobalTask");
const formNewGlobalTask = document.getElementById("formNewGlobalTask");
const taskSection = document.getElementById("task-section");

// Filtros de usuarios
const adminSearchUser = document.getElementById("adminSearchUser");

// Modal de usuario
const adminUsersTableBody = document.getElementById("adminUsersTableBody");
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
//                 INICIALIZACIÓN DEL DOCUMENTO
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

        // Obtener todas las tareas y Usuarios
        allUsers = await getAllUsers();
        allTasks = await getAllTasks();

        // Carga inicial de datos
        await loadAdminData(currentUser, allTasks, allUsers);

        showNotification(`¡Hola de nuevo, ${currentUser.name}!`, "success");
    } catch (error) {
        showNotification("Usuario no encontrado en la base de datos.", "error");
        console.log("Se ha presentado un error: " + error);
    }
});

// ===============================================================
//               EVENTOS DE PESTAÑAS Y NAVEGACIÓN
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

    tabTasks.className = "btn";
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
//                 EVENTOS DE FILTROS DE TAREAS
// ===============================================================

/*
    ACCION: FILTRA ACTIVAMENTE LA TABLA DE TAREAS POR TEXTO
*/
adminSearchTask.addEventListener("input", () => {
    const filteredTasks = applyAdminTaskFilters(allTasks, allUsers, adminSearchTask.value, adminFilterStatus.value); // Retorna lista de tareas filtradas
    renderAdminTasksTable(filteredTasks, allUsers); // Pinta la lista de tareas retornado de "filteredTasks"
});

/*
    ACCION: FILTRA ACTIVAMENTE LA TABLA DE TAREAS POR ESTADO
*/
adminFilterStatus.addEventListener("change", () => {
    const filteredTasks = applyAdminTaskFilters(allTasks, allUsers, adminSearchTask.value, adminFilterStatus.value); // Retorna lista de tareas filtradas
    renderAdminTasksTable(filteredTasks, allUsers); // Pinta la lista de tareas retornado de "filteredTasks"
});


// ===============================================================
//                EVENTOS DE FILTROS DE USUARIOS
// ===============================================================

/*
    ACCION: FILTRA ACTIVAMENTE LA TABLA DE USUARIOS POR TEXTO
*/
adminSearchUser.addEventListener("input", () => {
    const filteredUsers = applyAdminUserFilters(allUsers, adminSearchUser.value); // Retorna lista de usuarios filtrados
    renderAdminUsersTable(filteredUsers, allTasks); // Pinta la lista de usuarios retornado de "filteredUsers"
});

// ===============================================================
//  EVENTOS DE ACCIONES EN LA TABLA DE TAREAS (ELIMINAR || BORRAR)
// ===============================================================

adminTasksTableBody.addEventListener("click", async (e) => {
    /*
    ACCION: ELIMINAR TAREA
    */

    // Captura el boton que decidira la accion
    const btnDelete = e.target.closest(".btn-delete-task"); // Boton de eliminar tarea
    const btnEdit = e.target.closest(".btn-edit-task"); // Boton de editar tarea

    // Caso: Eliminar tarea 
    if (btnDelete) {
        body.classList.add("no-scroll"); // Bloquea el scroll del body
        const taskId = btnDelete.getAttribute("data-id"); // Obtiene el id de la tarea anidado en "data-id"
        const taskToDelete = allTasks.find(t => String(t.id) === String(taskId)); // Obtiene la tarea a eliminar

        if (!taskToDelete) return;

        showCustomConfirm(
            "Eliminar Tarea",
            `¿Estás seguro de que deseas eliminar esta tarea? \nEsta acción no tiene vuelta atras.`,
            async () => {

                // eliminar tarea
                const result = await serviceDeleteTask(taskId);

                if (!result.ok) return;

                // Elimina la tarea del array local de tareas
                allTasks = removeTaskFromArray(allTasks, taskToDelete.id);

                // Renderizar tareas actuales teniendo en cuenta si tiene algun filtro
                const filteredTasks = applyAdminTaskFilters(allTasks, allUsers, adminSearchTask.value, adminFilterStatus.value); // Obtiene tareas ya filtradas
                renderAdminTasksTable(filteredTasks, allUsers); // Renderiza tareas aplicando filtros

                // Actualizar informacion de usuarios
                const filteredUsers = applyAdminUserFilters(allUsers, adminSearchUser.value); // Obtiene usuarios ya filtrados
                renderAdminUsersTable(filteredUsers, allTasks) // Renderiza usuarios aplicando filtros

                body.classList.remove("no-scroll");
            }
        );
    }

    /*
    ACCION: ABRIR MODAL DE EDICION TAREA
    */

    if (btnEdit) {
        // Consultar tarea en espesifico
        const taskId = btnEdit.getAttribute("data-id");
        const taskToEdit = allTasks.find(task => String(task.id) === String(taskId));

        if (!taskToEdit) return;

        try {
            taskSection.classList.remove("hidden");
            body.classList.add("no-scroll");
            setTimeout(() => {
                modalContent.scrollTop = 0;
            }, 0);

            // Renderiza el Form de edicion de tarea junto a su informacion
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
    // Elimina dataset asociado a la edicion de tareas
    delete taskSection.dataset.id;

    // Renderiza la tabla y bloquea el scroll del body
    taskSection.classList.remove("hidden");
    body.classList.add("no-scroll");

    // Renderiza los usuarios a quienes se les asignara la tarea
    showEmpty(assignUserContainer);
    renderAssigneeCheckboxes(allUsers);
    setTimeout(() => {
        modalContent.scrollTop = 0;
    }, 0);
});

/*
    ACCION: CERRAR MODAL DE CREACION/EDICION DE TAREAS
*/
btnCancelGlobalTask.addEventListener("click", () => {
    // Cierra el modal y permite el scroll del body
    taskSection.classList.add("hidden");
    body.classList.remove("no-scroll");

    // Reinicia informacion del form total
    formNewGlobalTask.reset();
    hideEmpty(taskTitleError);
    hideEmpty(taskDescriptionError);
    hideEmpty(taskStatusError);
    hideEmpty(userSelectionError);

    // En caso de ser de edicion, elimina el data-id
    formCard.removeAttribute("data-id");
});

/*
    CASOS: EDICION/CREACION DE TAREA
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

            // Crea un cuerpo de la nueva tarea
            const newTaskUpdate = {
                title: taskTitleArea.value,
                description: taskDescriptionArea.value,
                status: taskStatusArea.value
            };

            const result = await serviceUpdateTask(taskId, newTaskUpdate); // Actualiza la tarea en la db

            // Valida si hay algun error
            if (!result.ok) return;

            allTasks = updateTaskInArray(allTasks, taskId, newTaskUpdate); // Actualiza la tarea localmente

            // Consulta tarea editada y la re-pinta
            const taskToEdit = allTasks.find(t => String(t.id) === String(taskId));
            repaintTask(taskToEdit, newTaskUpdate);

            const filteredTasks = applyAdminTaskFilters(allTasks, allUsers, adminSearchTask.value, adminFilterStatus.value); // Retorna tareas a mostrar en cuenta los filtros
            renderAdminTasksTable(filteredTasks, allUsers); // Pinta tareas retornadas de "filteredTasks"

            taskSection.classList.add("hidden");
            body.classList.remove("no-scroll");
            formCard.removeAttribute("data-id");

        });
        return;
    }

    // =================================
    // CASO: CREACIÓN DE TAREA MÚLTIPLE
    // =================================

    // Obtener IDs de usuarios seleccionados
    const selectedIds = Array.from(document.querySelectorAll('.user-assign-check:checked')).map(cb => cb.value);

    // Retorna array de todas las tareas a crear ( una tarea por usuario )
    const tasksToCreate = prepareMultipleTasks(
        taskTitleArea.value,
        taskDescriptionArea.value,
        taskStatusArea.value,
        getCurrentTimestamp(),
        "admin",
        selectedIds
    );

    const result = await servicePostTask(tasksToCreate) // Creacion de tareas

    if (!result.ok) return;

    // Actualizar lista local con las tareas creadas
    result.data.forEach(res => {
        if (res) {
            allTasks.unshift(res);
        }
    });

    // Actualizar UI
    const filteredTasks = applyAdminTaskFilters(allTasks, allUsers, adminSearchTask.value, adminFilterStatus.value); // Retorna tareas filtradas
    renderAdminTasksTable(filteredTasks, allUsers); // Renderiza tareas aplicando filtros activos

    // Cierra el Modal
    taskSection.classList.add("hidden");
    body.classList.remove("no-scroll"); // Permite el scroll en el body
    formNewGlobalTask.reset();
});


// ===============================================================
// EVENTOS DE ACCIONES EN LA TABLA DE USUARIOS (ELIMINAR | EDITAR)
// ===============================================================

adminUsersTableBody.addEventListener("click", (e) => {

    // Captura el boton segun el evento
    const btnDelete = e.target.closest(".btn-delete-user"); // Eliminar usuario
    const btnEdit = e.target.closest(".btn-edit-user"); // Editar usuario


    /*
        CASO: ELIMINAR USUARIO
    */
    if (btnDelete) {
        body.classList.add("no-scroll"); // Bloquea el scroll del body
        const userId = btnDelete.getAttribute("data-id"); // Obtiene el id del usuario con el "data-id"
        const user = allUsers.find(u => String(u.id) === String(userId)); // Obtiene el usuario en espesifico

        if (!user) return;

        showCustomConfirm(
            "Eliminar Usuario",
            `¿Estás seguro de que deseas eliminar a ${user.name.split(" ")[0]}? \nEsta acción no tiene vuelta atras.`,
            async () => {
                try {
                    // Eliminar usuario
                    const result = await serviceDeleteUser(userId);

                    if (!result.ok) return;

                    allUsers = removeUserFromArray(allUsers, userId); // Remueve el usuario eliminado del array local

                    // Aplica filtros a usuarios y renderiza
                    const filteredUsers = applyAdminUserFilters(allUsers, adminSearchUser.value); // Retorna los usuarios filtrados
                    renderAdminUsersTable(filteredUsers, allTasks); // Renderiza teniendo en cuenta el filtro

                    body.classList.remove("no-scroll"); // Permite el scroll en el body
                } catch (error) {
                    console.error("Error al eliminar usuario:", error);
                    showNotification("Hubo un error al eliminar el usuario", "error");
                }
            }
        );
    }

    /*
        ACCION: ABRIR MODAL DE EDICION DE USUARIO (unicamente abre el modal)
    */

    if (btnEdit) {
        body.classList.add("no-scroll");
        const userId = btnEdit.getAttribute("data-id");
        const user = allUsers.find(u => String(u.id) === String(userId));

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
    // Ocultar todos los errores al inicio
    hideEmpty(errorName);
    hideEmpty(errorEmail);
    hideEmpty(errorDocument);
    hideEmpty(errorRole);

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

    // Valida que los datos cumplan con la estructura
    const isValid = await validateUserForm(modalAdminUser);

    // En caso de no cumplir, cierra el proceso
    if (!isValid) {
        return;
    }

    // Crea estructura del nuevo usuario a crear
    const userData = {
        name: userNameInput.value.trim(),
        email: userEmailInput.value.trim(),
        document: userDocInput.value.trim(),
        role: userRoleInput.value
    };

    // Verifica si es un caso de edicion
    const userId = editUserId.value;
    const isEditing = userId !== "";


    try {
        /*
            CASO: EDICION DE DATOS DE USUARIO
        */
        if (isEditing) {
            showCustomConfirm(
                "Editar usuario",
                `¿Seguro que quieres actualizar los datos de ${userData.name.split(" ")[0]}?`,
                async () => {
                    const result = await servicePatchUser(userId, userData); // Actualizar usuario

                    // Valida si hay algun error
                    if (!result.ok) return;

                    allUsers = updateUserInArray(allUsers, userId, userData); // Actualiza la informacion del usuario en el array local

                    // Aplica filtros y renderiza usuarios
                    const filteredUsers = applyAdminUserFilters(allUsers, adminSearchUser.value); // Retorna los usuarios que pasen los filtros
                    renderAdminUsersTable(filteredUsers, allTasks); // Renderiza los usuarios

                    // Cierra modal
                    body.classList.remove("no-scroll"); // Permite el scroll en el body
                    modalUserForm.classList.add("hidden");
                    formUser.reset();
                }
            );
            return;
        }

        /*
            CASO: CREACION DE NUEVO USUARIO
        */
        const result = await servicePostUser(userData) // Crea usuario

        if (!result.ok) return; // Si hay un error, detiene el proceso.

        allUsers.push(result.data); // Agregar el nuevo usuario a la lista de usuarios

        body.classList.remove("no-scroll"); // Permitir el scroll en el body

        // Aplica filtros y renderiza usuarios
        const filteredUsers = applyAdminUserFilters(allUsers, adminSearchUser.value); // Consulta los usuarios que pasen los filtros
        renderAdminUsersTable(filteredUsers, allTasks); // Renderiza los usuarios

        // Oculta y limpia modal
        modalUserForm.classList.add("hidden");
        formUser.reset();

    } catch (error) {
        console.error("Error en la operación de usuario:", error);
        showNotification("Hubo un error al procesar la solicitud", "error");
    }
});
