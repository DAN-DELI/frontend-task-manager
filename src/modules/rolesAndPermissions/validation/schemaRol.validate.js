// Validacion del esquema de rol

import { hideContainer, showContainer } from "../../../utils";
import { fetchUsers } from "../../../api/users.api.js";
import { fetchRoles } from "../../../api/roles.api.js";

export const validateRoleCreate = async () => {
    const formName = document.querySelector("#role-name");
    const formDescription = document.querySelector("#role-description");
    const errorName = document.querySelector("#role-name-error");
    const errorDescription = document.querySelector("#role-description-error");

    let isValid = true;

    // ========================================================
    //                    VALIDAR NOMBRE
    // ========================================================
    const nameValue = formName.value.trim();
    const nameNormalized = nameValue.toLowerCase().trim();

    if (!nameValue) {
        errorName.textContent = 'El nombre del rol es obligatorio';
        showContainer(errorName);
        isValid = false;
    } else if (nameValue.length < 3) {
        errorName.textContent = 'El nombre debe tener al menos 3 caracteres';
        showContainer(errorName);
        isValid = false;
    } else if (nameValue.length > 50) {
        errorName.textContent = 'El nombre no puede exceder los 50 caracteres';
        showContainer(errorName);
        isValid = false;
    } else {
        errorName.textContent = '';
        hideContainer(errorName);
    }

    // ========================================================
    //                  VALIDAR DESCRIPCIÓN
    // ========================================================
    const descriptionValue = formDescription.value.trim();

    if (!descriptionValue) {
        errorDescription.textContent = 'La descripcion del rol es obligatorio';
        showContainer(errorDescription);
        isValid = false;
    } else if (descriptionValue.length > 0 && descriptionValue.length < 10) {
        errorDescription.textContent = 'La descripción debe tener al menos 10 caracteres';
        showContainer(errorDescription);
        isValid = false;
    } else if (descriptionValue.length > 255) {
        errorDescription.textContent = 'La descripción no puede exceder los 255 caracteres';
        showContainer(errorDescription);
        isValid = false;
    } else {
        errorDescription.textContent = '';
        hideContainer(errorDescription);
    }

    if (!isValid) return isValid;

    // Validar que el nombre no este registrado
    const users = await fetchRoles();
    const rolesArray = Array.isArray(users) ? users : users?.data ?? [];

    const rolesNamesNormalized = new Set(
        rolesArray
            .map(u => u?.name)
            .filter(Boolean)
            .map(n => String(n).trim().toLowerCase())
    );

    if (rolesNamesNormalized.has(nameNormalized)) {
        errorName.textContent = 'El nombre del rol ya se encuentra registrado';
        showContainer(errorName);
        isValid = false;
    }

    return isValid;
};


export const validateRoleEditing = async (currentRoleId = null) => {
    const formName = document.querySelector("#role-name");
    const formDescription = document.querySelector("#role-description");
    const errorName = document.querySelector("#role-name-error");
    const errorDescription = document.querySelector("#role-description-error");

    let isValid = true;

    // ========================================================
    //                    VALIDAR NOMBRE
    // ========================================================
    const nameValue = formName.value.trim();
    const nameNormalized = nameValue.toLowerCase().trim();

    if (!nameValue) {
        errorName.textContent = 'El nombre del rol es obligatorio';
        showContainer(errorName);
        isValid = false;
    } else if (nameValue.length < 3) {
        errorName.textContent = 'El nombre debe tener al menos 3 caracteres';
        showContainer(errorName);
        isValid = false;
    } else if (nameValue.length > 50) {
        errorName.textContent = 'El nombre no puede exceder los 50 caracteres';
        showContainer(errorName);
        isValid = false;
    } else {
        errorName.textContent = '';
        hideContainer(errorName);
    }

    // ========================================================
    //                  VALIDAR DESCRIPCIÓN
    // ========================================================
    const descriptionValue = formDescription.value.trim();

    if (!descriptionValue) {
        errorDescription.textContent = 'La descripcion del rol es obligatorio';
        showContainer(errorDescription);
        isValid = false;
    } else if (descriptionValue.length > 0 && descriptionValue.length < 10) {
        errorDescription.textContent = 'La descripción debe tener al menos 10 caracteres';
        showContainer(errorDescription);
        isValid = false;
    } else if (descriptionValue.length > 255) {
        errorDescription.textContent = 'La descripción no puede exceder los 255 caracteres';
        showContainer(errorDescription);
        isValid = false;
    } else {
        errorDescription.textContent = '';
        hideContainer(errorDescription);
    }

    if (!isValid) return isValid;

    // Validar que el nombre no este registrado (excluyendo el rol actual si se está editando)
    const roles = await fetchRoles();
    const rolesArray = Array.isArray(roles) ? roles : roles?.data ?? [];

    // Buscar si existe otro rol con el mismo nombre (excluyendo el rol actual)
    const duplicateRole = rolesArray.find(role => {
        const roleName = role?.name;
        if (!roleName) return false;
        const normalizedRoleName = String(roleName).trim().toLowerCase();
        const roleId = Number(role.id);
        const currentId = Number(currentRoleId);

        return normalizedRoleName === nameNormalized && roleId !== currentId;
    });

    if (duplicateRole) {
        errorName.textContent = 'El nombre del rol ya se encuentra registrado';
        showContainer(errorName);
        isValid = false;
    }

    return isValid;
};