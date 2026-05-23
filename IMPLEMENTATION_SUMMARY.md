# Implementación: Separación de Vistas de Tareas (Mis Tareas vs Todas las Tareas)

## 📋 Resumen

Se implementó la funcionalidad para mostrar dos secciones independientes en la vista de tareas:
- **Mis Tareas**: Muestra únicamente las tareas asignadas al usuario actual
- **Todas las Tareas**: Muestra todas las tareas del sistema

Cada sección se muestra solo si el usuario tiene el permiso correspondiente, permitiendo una gestión granular de accesos.

## 🔧 Cambios Realizados

### 1. Backend (ya implementado por el usuario)
- ✅ Endpoint `GET /api/tasks/my-tasks` - Obtiene tareas asignadas al usuario
- ✅ Permiso `tasks.view.own` - Permite ver solo tareas propias
- ✅ Permiso `tasks.view` - Permite ver todas las tareas (ya existía)

### 2. Frontend - API (`src/api/tasks.api.js`)
```javascript
/**
 * Obtiene las tareas propias del usuario (donde está asignado).
 * @returns {Promise<Array>} Lista de tareas asignadas al usuario
 */
export async function fetchMyTasks() {
    const res = await apiFetch('/api/tasks/my-tasks');
    const response = await res.json();
    if (!response.success) {
        throw new Error(response.message || 'Error al obtener mis tareas');
    }
    return response.data;
}
```

### 3. Frontend - Vista (`src/modules/tasks/view/tasks.view.js`)
- ✅ Modificada para aceptar objeto de configuración con:
  - `canAssign`: Si puede crear tareas
  - `showMyTasks`: Si debe mostrar sección "Mis Tareas"
  - `showAllTasks`: Si debe mostrar sección "Todas las Tareas"
- ✅ Cada sección tiene sus propios filtros independientes
- ✅ Estructura HTML con dos contenedores separados

### 4. Frontend - Controlador (`src/modules/tasks/controller/tasks.controller.js`)
- ✅ Estado local separado: `myTasks` y `allTasks`
- ✅ Filtros independientes: `myTasksFilter` y `allTasksFilter`
- ✅ Funciones de carga separadas: `loadMyTasksData()` y `loadAllTasksData()`
- ✅ Renderizado independiente por sección
- ✅ Eventos de filtros específicos para cada sección
- ✅ Búsqueda de tareas en ambas listas al editar

### 5. Frontend - Rutas (`src/router/routes.js`)
```javascript
{
    path: "#/tasks",
    view: () => tasksView({
        canAssign: hasPermission('tasks.create'),
        showMyTasks: hasPermission('tasks.view.own'),
        showAllTasks: hasPermission('tasks.view')
    }),
    init: (params) => tasksInit(params),
    private: true,
    permission: (user) => hasPermission('tasks.view.own') || hasPermission('tasks.view')
}
```

### 6. Frontend - Router (`src/router/router.js`)
- ✅ Agregado soporte para funciones en el campo `permission`
- ✅ Permite lógica condicional más compleja para validación de permisos

### 7. Estilos (`src/style.css`)
```css
.tasks-section {
    margin-bottom: 40px;
}

.section-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--text-primary);
    padding-bottom: 8px;
    border-bottom: 2px solid var(--bg-tertiary);
}
```

## 🎯 Comportamiento por Roles

### Usuario con solo `tasks.view.own` (ej: Aprendiz)
- ✅ Ve solo la sección "Mis Tareas"
- ✅ Puede ver sus tareas asignadas
- ✅ Puede filtrar sus tareas por estado
- ✅ Puede editar tareas (si tiene `tasks.update`)

### Usuario con solo `tasks.view` (ej: Evaluador/Administrador)
- ✅ Ve solo la sección "Todas las Tareas"
- ✅ Puede ver todas las tareas del sistema
- ✅ Puede filtrar todas las tareas por estado
- ✅ Puede editar/eliminar tareas (si tiene permisos)

### Usuario con ambos permisos
- ✅ Ve ambas secciones
- ✅ Puede interactuar con ambas independientemente
- ✅ Cada sección mantiene sus propios filtros

## 🔄 Flujo de Carga de Datos

1. **Inicialización** (`tasksInit`):
   - Verifica permisos del usuario
   - Determina qué secciones mostrar
   - Carga datos de las secciones activas en paralelo

2. **Carga de Mis Tareas**:
   - Llama a `fetchMyTasks()` → `/api/tasks/my-tasks`
   - Filtra por usuario autenticado (backend)
   - Renderiza en `#my-tasks-container`

3. **Carga de Todas las Tareas**:
   - Llama a `fetchTasks()` → `/api/tasks`
   - Obtiene todas las tareas
   - Renderiza en `#all-tasks-container`

4. **Filtros**:
   - Cada sección tiene sus propios botones de filtro
   - Los filtros son independientes entre secciones
   - Al cambiar un filtro, solo se actualiza esa sección

## 🛡️ Seguridad

- ✅ El backend valida permisos en cada endpoint
- ✅ El frontend verifica permisos antes de mostrar secciones
- ✅ El router valida acceso a la ruta completa
- ✅ Los datos se filtran en el backend (no solo en frontend)

## 📁 Archivos Modificados

1. `src/api/tasks.api.js` - Agregada función `fetchMyTasks()`
2. `src/modules/tasks/view/tasks.view.js` - Rediseñada para dos secciones
3. `src/modules/tasks/controller/tasks.controller.js` - Lógica para manejar dos secciones
4. `src/router/routes.js` - Configuración de permisos dinámicos
5. `src/router/router.js` - Soporte para funciones en validación de permisos
6. `src/style.css` - Estilos para nuevas secciones

## ✅ Pruebas Recomendadas

1. **Usuario con solo `tasks.view.own`**:
   - Iniciar sesión como usuario con permiso `tasks.view.own`
   - Verificar que solo ve "Mis Tareas"
   - Verificar que las tareas mostradas son solo las asignadas

2. **Usuario con solo `tasks.view`**:
   - Iniciar sesión como usuario con permiso `tasks.view`
   - Verificar que solo ve "Todas las Tareas"
   - Verificar que ve todas las tareas del sistema

3. **Usuario con ambos permisos**:
   - Iniciar sesión como administrador
   - Verificar que ve ambas secciones
   - Verificar que los filtros funcionan independientemente

4. **Usuario sin permisos**:
   - Verificar que no puede acceder a la ruta `#/tasks`
   - Debería recibir error 403

## 🚀 Próximos Pasos (Opcionales)

1. **Mejorar UX**:
   - Agregar indicador visual de cuántas tareas hay en cada sección
   - Agregar opción para colapsar/expandir secciones
   - Mostrar badge con conteo de tareas por estado

2. **Optimización**:
   - Implementar caché de tareas para evitar recargas innecesarias
   - Agregar paginación si hay muchas tareas

3. **Funcionalidad**:
   - Implementar edición de estado con avance progresivo (pendiente → en-progreso → completada)
   - Agregar notificaciones cuando se asigne una nueva tarea

## 📝 Notas Importantes

- El backend ya fue implementado por el usuario con la IA
- Se mantuvo el permiso `tasks.view` existente para no romper funcionalidad previa
- El nuevo permiso `tasks.view.own` es independiente
- Ambos permisos pueden coexistir en el mismo rol/usuario
- La validación de permisos ocurre en múltiples niveles (router, vista, controlador)