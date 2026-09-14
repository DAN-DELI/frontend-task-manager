import { API_URL, PORT } from "../config/api.config";

// DEFINIR URL BASE

// ---------------------------------------------------------------
//                          LOGIN
// ---------------------------------------------------------------

export async function login({ document, password }) {

    const baseUrl = `${API_URL}:${PORT}`;

    // Login de usuario
    const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            document: document,
            password: password
        })
    })

    if (!res) {
        throw new Error("Error al realizar la solicitud");
        return
    }

    const response = await res.json()
    return response
};

// ---------------------------------------------------------------
//                          FORGOT PASSWORD
// ---------------------------------------------------------------
export async function forgotPassword(email) {
    const baseUrl = `${API_URL}:${PORT}`;

    const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
    })

    if (!res) {
        throw new Error("Error al realizar la solicitud");
        return
    }

    const response = await res.json()
    return response
};

// ---------------------------------------------------------------
//                          REGISTER
// ---------------------------------------------------------------
export async function register(userData) {
    const baseUrl = `${API_URL}:${PORT}`;

    const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });

    if (!res) {
        throw new Error("Error al realizar la solicitud");
        return;
    };

    const response = await res.json();
    return response;
};

// ---------------------------------------------------------------
//                        RESET PASSWORD
// ---------------------------------------------------------------
// Funcion para resetear la contraseña
export async function resetPassword(token, newPassword) {
    const baseUrl = `${API_URL}:${PORT}`;

    const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword })
    });

    const response = await res.json();

    console.log(response)
    return response
}