import { generateNavItems } from "../layout/index.js";
import { headerLayout } from "../layout/index.js";
import { headerInit } from "../layout/index.js";
import { navigateTo } from "../utils/index.js";
import { routes } from "./routes.js";

// ========================================================
//   MONTAR LAYOUT SI NO EXISTE (solo rutas privadas)
// ========================================================
const ensureLayout = () => {
    // Sin sesión -> login
    if (!localStorage.getItem('user')) {
        navigateTo("#/login");
        return false;
    }

    // Si ya está montado, no lo tocamos
    if (document.querySelector("#main-content")) return true;

    // Primera vez: inyectar header + main-content
    const app = document.querySelector("#app");
    const navItems = generateNavItems();
    app.innerHTML = headerLayout(navItems);
    headerInit();

    return true;
};

// ========================================================
//                 PARÁMETROS DINÁMICOS
// ========================================================
const extractRouteParams = (routePath, path) => {
    const routeSegments = routePath.split('/');
    const pathSegments = path.split('/');
    const params = {};

    if (routeSegments.length !== pathSegments.length) {
        return null;
    }

    for (let i = 0; i < routeSegments.length; i++) {
        const routeSegment = routeSegments[i];
        const pathSegment = pathSegments[i];

        if (routeSegment.startsWith(':')) {
            params[routeSegment.substring(1)] = pathSegment;
        } else if (routeSegment !== pathSegment) {
            return null;
        }
    }
    return params;
};

// ========================================================
//                 BUSCAR RUTA
// ========================================================
const findRoute = (path) => {
    for (const route of routes) {
        const params = extractRouteParams(route.path, path);
        if (params != null) {
            return { route, params };
        }
    }
    return { route: null, params: {} };
};

// ========================================================
//                 RENDER (SOPORTA ASINCRONIA)
// ========================================================
const render = async () => {
    const path = window.location.hash || "#/login";
    const { route, params } = findRoute(path);

    // 404
    if (!route) {
        const container = document.querySelector("#app");
        container.innerHTML = `
            <section class="home-section">
                <h2>404</h2>
                <p>Ruta no encontrada.</p>
                <a href="#/home" class="btn">Volver al inicio</a>
            </section>
        `;
        return;
    }

    // ---------------------------------------------------
    // RUTAS PRIVADAS
    // ---------------------------------------------------
    if (route.private) {
        const ready = ensureLayout();
        if (!ready) return; // Fue redirigido a login

        const container = document.querySelector("#main-content");

        // Soporte para vistas sync y async
        const viewResult = route.view();
        container.innerHTML = viewResult instanceof Promise ? await viewResult : viewResult;

        if (route.init) route.init(params);
        return;
    }

    // ---------------------------------------------------
    // RUTAS PÚBLICAS
    // ---------------------------------------------------
    const container = document.querySelector("#app");

    // Si veníamos de una privada, limpiar el layout anterior
    if (document.querySelector(".header")) {
        container.innerHTML = '';
    }

    const viewResult = route.view();
    container.innerHTML = viewResult instanceof Promise ? await viewResult : viewResult;

    if (route.init) route.init(params);
};

// ========================================================
//                       initRouter
// ========================================================
export const initRouter = () => {
    render();
};