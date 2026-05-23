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


// ---------------------------------------------------------------
//                     SHOW CONFIRM THEN ALERT
// ---------------------------------------------------------------

/**
 * Muestra un modal de confirmación y, si el usuario confirma, muestra 
 * automáticamente una alerta de éxito (o el tipo que se indique).
 * 
 * @param {string} confirmTitle - Título del modal de confirmación.
 * @param {string} confirmText - Descripción de la acción a confirmar.
 * @param {string} [successTitle="¡Hecho!"] - Título del modal posterior.
 * @param {string} [successText="La acción se completó correctamente."] - Texto del modal posterior.
 * @param {string} [confirmBtnText="Sí, eliminar"] - Texto del botón de confirmación.
 * @param {string} [cancelBtnText="Cancelar"] - Texto del botón de cancelar.
 * @param {Function} [onConfirm] - Callback opcional ejecutado solo si confirma.
 * @returns {Promise<boolean>} Resuelve `true` si se confirmó, `false` si se canceló.
 */
export const showConfirmThenAlert = async (
    confirmTitle,
    confirmText,
    successTitle = "¡Hecho!",
    successText = "La acción se completó correctamente.",
    confirmBtnText = "Sí, eliminar",
    cancelBtnText = "Cancelar",
    onConfirm = null
) => {
    const result = await Swal.fire({
        title: confirmTitle,
        text: confirmText,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: confirmBtnText,
        cancelButtonText: cancelBtnText,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#334155",
        background: "#1e293b",
        color: "#f1f5f9"
    });

    if (result.isConfirmed) {
        if (typeof onConfirm === "function") await onConfirm();

        await Swal.fire({
            title: successTitle,
            text: successText,
            icon: "success",
            confirmButtonColor: "#2563eb",
            background: "#1e293b",
            color: "#f1f5f9"
        });

        return true;
    }

    return false;
};