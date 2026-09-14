# Task Manager

Aplicación web de gestión de tareas, usuarios, roles y permisos. Está construida como una SPA (Single Page Application) con JavaScript modular, Vite y un enrutador basado en hash.

## Funcionalidades

- Registro, inicio de sesión y recuperación de contraseña.
- Gestión de tareas: consulta, creación, edición y eliminación según permisos.
- Gestión de usuarios y asignación de roles.
- Administración de roles y permisos.
- Configuración de preferencias del usuario.
- Rutas privadas protegidas por autenticación.
- Control de acceso por permisos y vistas de error `403` y `404`.
- Renovación automática del token cuando una petición responde con `401`.
- Temas visuales y persistencia de la sesión en `localStorage`.

## Requisitos

- Node.js 18 o superior.
- npm.
- Un backend compatible disponible en `http://localhost:3000`.

El frontend espera una API REST que gestione autenticación, usuarios, tareas, roles, permisos y configuración. La URL base se define en `src/config/api.config.js`.

## Instalación

1. Clona el repositorio y entra en la carpeta del proyecto:

   ```bash
   git clone https://github.com/DAN-DELI/frontend-task-manager.git
   cd frontend-task-manager
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Verifica que el backend esté ejecutándose en el puerto `3000`.

## Ejecución

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará en la terminal la URL local, normalmente `http://localhost:5173`.

Para generar una versión de producción:

```bash
npm run build
```

Para previsualizar la compilación:

```bash
npm run preview
```

## Configuración de la API

La configuración actual apunta a:

```js
export const API_URL = "http://localhost";
export const PORT = "3000";
```

Para utilizar otro servidor, modifica `src/config/api.config.js` antes de iniciar la aplicación. El cliente HTTP añade automáticamente el token de acceso en la cabecera `Authorization` y gestiona la renovación mediante `/api/auth/refresh`.

## Estructura del proyecto

```text
src/
├── api/                    # Clientes y adaptadores para la API REST
├── config/                 # Configuración global, incluida la URL de la API
├── layout/                 # Header, navegación y estructura compartida
├── modules/
│   ├── auth/               # Login, registro y recuperación de contraseña
│   ├── errors/             # Vistas 403 y 404
│   ├── home/               # Vista principal
│   ├── rolesAndPermissions/# Administración de roles y permisos
│   ├── settings/           # Preferencias y configuración
│   ├── tasks/              # Gestión de tareas
│   └── users/              # Gestión de usuarios
├── router/                 # Rutas y navegación SPA
└── utils/                  # Autenticación, permisos, navegación y UI
```

Cada módulo separa, cuando corresponde, su vista, controlador y validaciones. `src/main.js` carga los estilos, restaura el tema guardado e inicializa el router.

## Rutas principales

### Públicas

- `#/login`
- `#/register`
- `#/forgot-password`
- `#/reset-password/:token`

### Privadas

- `#/home`
- `#/tasks`
- `#/tasks/create`
- `#/tasks/:id/edit`
- `#/users`
- `#/users/create`
- `#/users/:id/assign-roles`
- `#/rolesAndPermissions`
- `#/rolesAndPermissions/create`
- `#/rolesAndPermissions/view/:id`
- `#/rolesAndPermissions/edit/:id`
- `#/settings`
- `#/settings/edit`

El acceso a las rutas privadas requiere una sesión activa. Algunas rutas también requieren permisos específicos, como `tasks.create`, `tasks.update`, `users.view`, `roles.view` o `settings` según la respuesta del backend.

## Tecnologías

- JavaScript (módulos ES).
- Vite 7.
- HTML y CSS.
- SweetAlert2 para notificaciones y diálogos.
- Fetch API para la comunicación con el backend.
- Express, CORS y json-server disponibles como dependencias del proyecto.

## Documentación adicional

- [Documentación técnica](docs/DOCUMENTATION.md)
- [Acuerdo de trabajo del equipo](TEAM_AGREEMENT.md)

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo de Vite. |
| `npm run build` | Genera la compilación de producción. |
| `npm run preview` | Sirve localmente la compilación generada. |

## Estado del proyecto

El proyecto se encuentra en desarrollo activo. La aplicación frontend depende de que el backend compatible esté disponible y correctamente configurado antes de iniciar sesión.
