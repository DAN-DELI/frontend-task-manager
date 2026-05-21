import Swal from "sweetalert2";


// ---------------------------------------------------------------
//                          SHOW CONFIRMATION
// ---------------------------------------------------------------
/**
 * Muestra un modal de confirmación con botones de acción.
 * * @param {string} title - Título que aparece en la parte superior.
 * @param {string} text - Descripción de la acción a confirmar.
 * @returns {Promise<import('sweetalert2').SweetAlertResult>} Promesa con el resultado de la interacción (isConfirmed).
 */
export const showConfirmation = async (title, text) => {
    return await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        buttonsStyling: false,
        customClass: {
            popup: 'content-card',
            confirmButton: 'btn-danger',
            cancelButton: 'btn-secondary'
        }
    });
};


// ---------------------------------------------------------------
//                          SHOW ALERT
// ---------------------------------------------------------------

/**
 * Muestra una alerta reutilizable con SweetAlert2.
 * 
 * @param {string} type - Tipo de alerta. || Puede ser: success | error | warning | info | question
 * @param {string} message - Mensaje principal.
 * @param {string} [title="Sistema"] - Título opcional.
 */

export const showAlert = (type, message, title = "Sistema") => {
    Swal.fire({
        icon: type,
        title,
        text: message,
        confirmButtonColor: "#2563eb"
    });
};

// ---------------------------------------------------------------
//                          SHOW TOAST
// ---------------------------------------------------------------

/**
 * Muestra una notificación toast reutilizable.
 * 
 * @param {string} type - success | error | warning | info | question
 * @param {string} message - Mensaje de la alerta.
 */

export const showToast = (message, type, time = 3000) => {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: type,
        title: message,
        showConfirmButton: false,
        timer: time,
        timerProgressBar: true
    });
};

// ---------------------------------------------------------------
//                       SHOW CONFIRM ALERT
// ---------------------------------------------------------------

/**
 * Muestra una alerta modal con boton de confirmacion.
 * Ejecuta un callback cuando el usuario presiona OK.
 * 
 * @param {string} type - success | error | warning | info | question
 * @param {string} message - Mensaje principal.
 * @param {string} [title="Sistema"] - Titulo opcional.
 * @param {string} [confirmText="Aceptar"] - Texto del boton.
 * @param {Function} [onConfirm] - Funcion a ejecutar al confirmar.
 */

export const showConfirm = (type, message, title = "Sistema", confirmText = "Aceptar", onConfirm = null) => {
    Swal.fire({
        icon: type,
        title,
        text: message,
        confirmButtonText: confirmText,
        confirmButtonColor: "#2563eb",
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed && typeof onConfirm === "function") {
            onConfirm();
        }
    });
};