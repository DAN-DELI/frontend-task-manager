// ========================================
// JAVASCRIPT PARA EL ARCHIVO "login.html"
// ========================================

import { validateUserService } from "./services/userService.js";
import { showNotification } from "./ui/notificationsUI.js";

const validateBtn = document.getElementById("validateBtn");
const documentoInput = document.getElementById("documento");

// ================= VALIDAR USUARIO =================
/**
 * Evento para validar el usuario a partir del ID ingresado.
 * - Llama a `validateUserService` para obtener datos del usuario
 * - Si existe, carga las tareas del usuario y renderiza la UI
 */
validateBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const docValue = documentoInput.value.trim();

    documentoInput.value = "";
    documentoInput.blur();

    if (!docValue || isNaN(docValue)) {
        showNotification("Documento inválido. Por favor, ingresa un número.", "warning");
        return;
    }

    try {
        let currentUser = await validateUserService(docValue);

        if (currentUser == null) {
            showNotification("Usuario no registrado.", "error");
            return;
        }

        // se guarda el usuario que acaba de ingresar
        localStorage.setItem('usuarioActivo', JSON.stringify(currentUser));

        // se envia al archivo correspondiente al rol
        if (currentUser.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "user.html";
        }


    } catch (error) {
        // Captura el mensaje real enviado por el backend (vía response.handler)
        showNotification(error.message || "Error de conexión con el servidor", "error");
        console.error("Se ha presentado un error en el login: ", error);
    }
});



// ================= AL INICIAR EL DOCUMENTO =================
document.addEventListener("DOMContentLoaded", () => {
    //si ingresa con un un registro en el localStorage/usuarioActivo, este se elimina
    if (localStorage.getItem('usuarioActivo')) {
        console.log("Se ha cerrado la anterior seccion.")
        localStorage.removeItem('usuarioActivo')
    }

    // focalizamos en el input
    if (documentoInput) {
        documentoInput.focus();
    }
})

