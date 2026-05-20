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
import { settingsView, settingsInit } from "../modules/settings/index";
import { tasksView} from "../modules/tasks/index";
import { usersView } from "../modules/users/index";

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
        init: inProgressInit,
        private: true
    },


    // HASH DE USUARIOS
    {
        path: "#/users",
        view: () => usersView(),
        init: inProgressInit,
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
    console.log("Vista en construcción");
}