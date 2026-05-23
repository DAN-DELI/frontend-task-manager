// ========================================================
//                      IMPORTACIONES
// ========================================================
import {
    forgotPasswordInit,
    ForgotPasswordView,
    loginInit,
    LoginView,
    registerInit,
    RegisterView,
    resetPasswordInit,
    resetPasswordView
} from "../modules/auth/index";
import { homeView } from "../modules/home/index";
import { hasPermission } from '../utils/auth.utils.js';
import { checkUserManagementAccess } from '../utils/auth.guard.js';
import { rolesListView, renderRolesList, renderCreateRole, renderEditRole, onlyViewController } from "../modules/rolesAndPermissions/index";
import { settingsView, settingsInit, settingsEditView, settingsEditInit } from "../modules/settings/index";
import { tasksView, tasksInit } from "../modules/tasks/index";
import { renderUsersList, renderCreateUser, renderAssignRoles } from "../modules/users/index";


// ========================================================
//                          RUTAS
// ========================================================

export const routes = [
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    //                             PUBLICAS
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    {
        path: "#/login",
        view: () => LoginView(),
        init: () => loginInit(),
        private: false
    },
    {
        path: "#/register",
        view: () => RegisterView(),
        init: () => registerInit(),
        private: false
    },
    {
        path: "#/forgot-password",
        view: () => ForgotPasswordView(),
        init: () => forgotPasswordInit(),
        private: false
    },
    {
        path: "#/reset-password/:token",
        view: () => resetPasswordView(),
        init: (token) => resetPasswordInit(token),
        private: false
    },

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    //                             PRIVADAS
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=


    // HASH DE HOME
    {
        path: "#/home",
        view: () => homeView(),
        init: () => console.log("En vista #/home"),
        private: true
    },


    // HASH DE TAREAS
    {
        path: "#/tasks",
        view: () => tasksView({
            canAssign: hasPermission('tasks.create'),
            showMyTasks: hasPermission('tasks.view.own'),
            showAllTasks: hasPermission('tasks.view')
        }),
        init: (params) => tasksInit(params),
        private: true,
        // Permitir acceso si tiene ALGUNO de los dos permisos de lectura
        permission: (user) => hasPermission('tasks.view.own') || hasPermission('tasks.view')
    },

    // HASH DE EDITAR TAREA
    {
        path: "#/tasks/:id/edit",
        view: () => tasksView({
            canAssign: hasPermission('tasks.create'),
            showMyTasks: hasPermission('tasks.view.own'),
            showAllTasks: hasPermission('tasks.view')
        }),
        init: (params) => tasksInit(params),
        private: true,
        permission: 'tasks.update'
    },

    // HASH DE USUARIOS - ACTUALIZADO
    {
        path: "#/users",
        // 2. Devolvemos un div contenedor donde el controlador inyectará la vista
        view: () => `<div id="users-view-container">Cargando usuarios...</div>`,
        // 3. El init busca ese contenedor y llama a renderUsersList
        init: () => {
            const container = document.querySelector("#users-view-container");
            if (container) {
                renderUsersList(container);
            }
        },
        private: true
    },
    // HASH DE CREACIÓN DE USUARIOS
    {
        path: "#/users/create",
        view: () => `<div id="user-create-container">Cargando formulario...</div>`,
        init: () => {
            if (!checkUserManagementAccess()) return;
            const container = document.querySelector("#user-create-container");
            if (container) renderCreateUser(container);
        },
        private: true
    },
    // --- HASH DE ASIGNACIÓN DE ROLES ---
    {
        path: "#/users/:id/assign-roles",
        view: () => `<div id="user-assign-roles-container">Cargando asignación de roles...</div>`,
        init: (params) => {
            if (!checkUserManagementAccess()) return;
            const container = document.querySelector("#user-assign-roles-container");
            if (container && params) renderAssignRoles(container, params);
        },
        private: true
    },

    // HASH DE ROLES Y PERMISOS
    {
        path: "#/rolesAndPermissions",
        view: () => `<div id="roles-view-container">Cargando...</div>`,
        init: () => {
            const container = document.querySelector("#roles-view-container");
            if (container) renderRolesList(container);
        },
        private: true
    },

    // HASH CREAR ROL
    {
        path: "#/rolesAndPermissions/create",
        view: () => `<div id="role-create-container">Cargando formulario...</div>`,
        init: () => {
            const container = document.querySelector("#role-create-container");
            if (container) renderCreateRole(container);
        },
        private: true
    },
    // HASH VISUALIZAR ROL
    {
        path: "#/rolesAndPermissions/view/:id",
        view: () => `<div id="role-create-container">Cargando vista...</div>`,
        init: (params) => onlyViewController(params),
        private: true
    },
    // HASH EDITAR ROL
    {
        path: "#/rolesAndPermissions/edit/:id",
        view: () => `<div id="role-edit-container">Cargando...</div>`,
        init: (params) => {
            const container = document.querySelector("#role-edit-container");
            if (container && params) renderEditRole(container, params);
        },
        private: true
    },

    // HASH DE CONFIGURACIONES
    {
        path: "#/settings",
        view: () => settingsView(),
        init: () => settingsInit(),  // registra todos los listeners
        private: true
    }
];

// FUNCIONES TEMPORALES PARA VISTAS EN CONSTRUCCIÓN
function inProgressView(isPrivate) {
    if (isPrivate == "si") {
        return `
        <div class="in-progress">
            <h2>En construcción de vista privada...</h2>
        </div>  
        `;
    }

    return `
        <div class="in-progress">
            <h2>En construcción de vista publica...</h2>
        </div>  
    `;
};

function inProgressInit() {
    // console.log("Vista en construcción");
}