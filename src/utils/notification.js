import Swal from "sweetalert2";

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