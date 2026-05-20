export const tasksView = () => {
    return `
    <section class="tasks-page">

        <div class="tasks-header">
            <div>
                <h1 class="page-title">Tareas</h1>
                <p class="page-subtitle">Gestiona y realiza seguimiento de las tareas</p>
            </div>
            <button class="btn-primary btn-icon" id="btn-new-task">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Nueva tarea
            </button>
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
