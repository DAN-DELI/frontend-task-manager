import { headerLayout } from "../layout/index";
import { navigateTo } from "../utils";
import { routes } from "./routes";

// Renderizar header y sidebar principal
const renderLayout = () => {

    // Validar que el usuario este autenticado
    if (localStorage.getItem('user') == null) {
        navigateTo("#/login");
    }

    // Seleccionar ubicacion del renderizado
    const container = document.querySelector("#app");

    const headerPath = routes.find(r => r.path === "#/navigation");

    container.innerHTML = headerPath.view();

    headerPath.init();

};


const extractRouteParams = (routePath, path) => {
    const routeSegments = routePath.split('/');
    const pathSegments = path.split('/');
    const params = {}
    // Validamos que tengan el mismo tamaño, caso contrario se descarta
    if (routeSegments.length !== pathSegments.length) {
        return null;
    }
    for (let i = 0; i < routeSegments.length; i++) {
        const routeSegment = routeSegments[i];
        const pathSegment = pathSegments[i];
        // Validamos si el segmento de la ruta es dinamico 
        if (routeSegment.startsWith(':')) {
            // Le quitamos el primer caracter
            const paramKey = routeSegment.substring(1);
            params[paramKey] = pathSegment;
        } else if (routeSegment !== pathSegment) {
            return null;
        }
    }
    return params
}


const findRoute = (path) => {

    for (const route of routes) {
        const params = extractRouteParams(route.path, path)
        if (params != null) {
            return { route, params }
        }
    }

    let route = routes.find(r => r.path === path);
    // Retornamos la coincidencia
    return {
        route,
        params: {}
    };
}


const render = () => {

    const path = window.location.hash || "#/login";

    let { route, params } = findRoute(path);

    if (!route) {
        return;
    }

    // ---------------------------------------------------
    // RUTAS PRIVADAS
    // ---------------------------------------------------

    if (route.private) {

        // Si el layout no está renderizado, lo renderizamos
        if (!document.querySelector("#main-content")) {

            renderLayout();
        };

        // Renderizamos dentro del content
        const container = document.querySelector("#main-content");

        container.innerHTML = route.view();

    }

    // ---------------------------------------------------
    // RUTAS PUBLICAS
    // ---------------------------------------------------

    else {

        const container = document.querySelector("#app");

        container.innerHTML = route.view();

    }

    route.init(params);

};

export const initRouter = () => {
    render()
};