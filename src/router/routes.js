import { headerInit, headerLayout } from "../layout/index";
import {
    forgotPasswordInit,
    ForgotPasswordView,
    loginInit,
    LoginView,
    registerInit,
    RegisterView
} from "../modules/auth/index";

import { rolesAndPermissionsView } from "../modules/rolesAndPermissions/index";
import { settingsView } from "../modules/settings/index";
import { tasksView, tasksInit } from "../modules/tasks/index";
import { renderUsersList, renderCreateUser, renderEditUser } from "../modules/users/index";

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

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    //                             PRIVADAS
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    // NAVEGACION (HEADER BASE)
    {
        path: "#/navigation",
        view: () => headerLayout(),
        init: () => headerInit(),
        private: false
    },

    // HASH DE TAREAS
    {
        path: "#/tasks",
        view: () => tasksView(),
        init: tasksInit(),
        private: true
    },

    // HASH DE USUARIOS - ACTUALIZADO
    {
        path: "#/users",
        // 2. Devolvemos un div contenedor donde el controlador inyectará la vista
        view: () => `<div id="users-view-container">Cargando permisos de usuario...</div>`,
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
            const container = document.querySelector("#user-create-container");
            if (container) renderCreateUser(container);
        },
        private: true
    },
    // --- HASH DE EDICIÓN DE USUARIOS ---
    {
        path: "#/users/edit/:id",
        view: () => `<div id="user-edit-container">Cargando formulario de edición...</div>`,
        // Recibimos los 'params' que inyecta tu router.js
        init: (params) => {
            const container = document.querySelector("#user-edit-container");
            if (container && params) renderEditUser(container, params);
        },
        private: true
    },

    // HASH DE ROLES Y PERMISOS
    {
        path: "#/rolesAndPermissions",
        view: () => rolesAndPermissionsView(),
        init: inProgressInit,
        private: true
    },

    // HASH DE CONFIGURACIONES
    {
        path: "#/settings",
        view: () => settingsView(),
        init: inProgressInit,
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