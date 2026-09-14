import { fetchRoleById } from "../../../api/roles.api";
import { showAlert, showToast } from "../../../utils";

// Validadar que el rol a eliminar no sea ninguno de los roles por defecto del sistema
export const canDeleteRol = async (id) => {

    const role = await fetchRoleById(id);

    let canDelete = true;

    if (role.name == "Administrador" || role.name == "Evaluador" || role.name == "Aprendiz") {
        canDelete = false;
    }

    return canDelete;
};


export const addDeleteRol = (roleName) => {
    const systemRoles = ['Administrador', 'Evaluador', 'Aprendiz'];
    return !systemRoles.includes(roleName);
};