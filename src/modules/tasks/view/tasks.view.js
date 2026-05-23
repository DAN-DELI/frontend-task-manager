export const tasksView = (canAssign = false) => {
    return `
    <section class="tasks-page">

        <div class="tasks-header">
            <div>
                <h1 class="page-title">Tareas</h1>
                <p class="page-subtitle">Gestiona y realiza seguimiento de las tareas</p>
            </div>
        <div class="tasks-header-actions">
            <button class="btn-secondary btn-icon" id="btn-export-tasks">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Exportar
            </button>
            ${canAssign ? `
            <button class="btn-primary btn-icon" id="btn-new-task">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                    Nueva tarea
            </button>` : ''}
            </div>
        </div>
        <div class="tasks-filters" id="tasks-filters">
            <button class="filter-btn active" data-filter="all">Todas</button>
            <button class="filter-btn" data-filter="pendiente">Pendiente</button>
            <button class="filter-btn" data-filter="en-progreso">En progreso</button>
            <button class="filter-btn" data-filter="completada">Completada</button>
        </div>

        <div id="tasks-container" class="tasks-grid">
            <div class="tasks-loading">
                <span class="loading-spinner"></span>
                Cargando tareas...
            </div>
        </div>

    </section>

    <!--              MODAL CREAR / EDITAR                -->
    <div id="task-modal" class="modal hidden">
        <div class="modal-overlay" id="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title" id="modal-title">Nueva tarea</h2>
                <button class="modal-close" id="modal-close" type="button" aria-label="Cerrar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <form id="task-form" class="task-form">
                <input type="hidden" id="task-id" />

                <div class="input-group">
                    <label for="task-title">Título</label>
                    <div class="input-wrapper">
                        <input type="text" id="task-title" placeholder="Ej: Implementar módulo de autenticación" />
                    </div>
                    <span class="error-message hidden" id="title-error"></span>
                </div>

                <div class="input-group">
                    <label for="task-description">Descripción</label>
                    <textarea id="task-description" class="task-textarea" placeholder="Describe detalladamente la tarea..." rows="4"></textarea>
                    <span class="error-message hidden" id="description-error"></span>
                </div>

                <!--SECCIÓN: Asignar a usuarios -->
                ${canAssign ? `
                <div class="input-group">
                    <div class="assign-label-row">
                        <label>Asignar a</label>
                        <button type="button" id="btn-toggle-all" class="btn-toggle-all">
                            Seleccionar todos
                        </button>
                    </div>

                    <div id="users-checklist" class="users-checklist">
                        <div class="users-checklist-loading">
                            <span class="loading-spinner loading-spinner--sm"></span>
                            Cargando usuarios...
                        </div>
                    </div>
                    <span class="error-message hidden" id="assign-error"></span>
                </div>` : ''}

                <div class="input-group">
                    <label for="task-status">Estado</label>
                    <div class="input-wrapper">
                        <select id="task-status" class="task-select">
                            <option value="pendiente">Pendiente</option>
                            <option value="en-progreso">En progreso</option>
                            <option value="completada">Completada</option>
                        </select>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" id="btn-cancel">Cancelar</button>
                    <button type="submit" class="btn-primary" id="btn-save">Guardar</button>
                </div>
            </form>
        </div>
    </div>
    `;
};

/**
 * Genera el HTML de una tarjeta de tarea.
 * muestra los nombres de los usuarios asignados en el footer.
 * @param {Object}  task      - Datos de la tarea
 * @param {boolean} canUpdate - Si el usuario puede editar
 * @param {boolean} canDelete - Si el usuario puede eliminar
 */
export const taskCardHTML = (task, canUpdate = false, canDelete = false) => {
    const statusMap = {
        'pendiente':   { cls: 'badge-pending',    label: 'Pendiente' },
        'en-progreso': { cls: 'badge-in-progress', label: 'En progreso' },
        'completada':  { cls: 'badge-completed',   label: 'Completada' }
    };
    const { cls, label } = statusMap[task.status] ?? { cls: 'badge-pending', label: task.status };

    const desc = task.description
        ? (task.description.length > 120 ? task.description.slice(0, 120) + '...' : task.description)
        : '';

    const formatDate = (isoString) => {
        if (!isoString) return '—';
        return new Date(isoString).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    // Nombres de usuarios asignados
    const assigned = Array.isArray(task.assigned_users) ? task.assigned_users : [];
    const assignedLabel = assigned.length === 0
        ? 'Sin asignar'
        : assigned.map(u => u.name).join(', ');

    return `
        <article class="task-card" data-id="${task.id}">
            <div class="task-card-header">
                <span class="task-badge ${cls}">${label}</span>
                <div class="task-card-actions">
                    ${canUpdate ? `
                    <button class="task-btn-edit" data-id="${task.id}" title="Editar tarea" aria-label="Editar tarea">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>` : ''}
                    ${canDelete ? `
                    <button class="task-btn-delete" data-id="${task.id}" title="Eliminar tarea" aria-label="Eliminar tarea">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                        </svg>
                    </button>` : ''}
                </div>
            </div>

            <h3 class="task-card-title">${task.title}</h3>
            <p class="task-card-desc">${desc}</p>

            <div class="task-card-footer">
                <span class="task-card-date">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${formatDate(task.created_at)}
                </span>
                <span class="task-card-user" title="${assignedLabel}">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    ${assigned.length > 0
                        ? (assigned.length === 1
                            ? assigned[0].name
                            : `${assigned[0].name} +${assigned.length - 1}`)
                        : 'Sin asignar'}
                </span>
            </div>
        </article>
    `;
};

/**
 * Genera el HTML del listado de checkboxes para asignar usuarios.
 * @param {Array}  users           - Lista de usuarios no-admin { id, name, document }
 * @param {Array}  selectedIds     - IDs ya seleccionados (para modo edición)
 */
export const usersChecklistHTML = (users, selectedIds = []) => {
    if (users.length === 0) {
        return `<p class="checklist-empty">No hay usuarios disponibles para asignar.</p>`;
    }

    return users.map(u => {
        const checked = selectedIds.includes(u.id) ? 'checked' : '';
        return `
            <label class="checklist-item">
                <input type="checkbox"
                    class="checklist-checkbox"
                    value="${u.id}"
                    ${checked}
                />
                <span class="checklist-name">${u.name}</span>
                <span class="checklist-doc">${u.document}</span>
            </label>
        `;
    }).join('');
};