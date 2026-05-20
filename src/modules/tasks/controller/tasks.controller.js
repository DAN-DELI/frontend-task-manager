import Swal from 'sweetalert2';
import { fetchTasks, createTask, updateTaskPartial, deleteTask } from '../../../api/index.js';
import { showToast } from '../../../utils/index.js';

// ---------------------------------------------------------------
//                          ESTADO LOCAL
// ---------------------------------------------------------------
let allTasks = [];
let activeFilter = 'all';

// ---------------------------------------------------------------
//                      UTILIDADES INTERNAS
// ---------------------------------------------------------------

const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};

const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const getStatusBadge = (status) => {
    const map = {
        'pendiente':   { cls: 'badge-pending',     label: 'Pendiente' },
        'en-progreso': { cls: 'badge-in-progress',  label: 'En progreso' },
        'completada':  { cls: 'badge-completed',    label: 'Completada' }
    };
    return map[status] ?? { cls: 'badge-pending', label: status };
};

const taskCardHTML = (task) => {
    const { cls, label } = getStatusBadge(task.status);
    const desc = task.description
        ? (task.description.length > 120 ? task.description.slice(0, 120) + '...' : task.description)
        : '';

    return `
        <article class="task-card" data-id="${task.id}">
            <div class="task-card-header">
                <span class="task-badge ${cls}">${label}</span>
                <div class="task-card-actions">
                    <button class="task-btn-edit" data-id="${task.id}" title="Editar tarea" aria-label="Editar tarea">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="task-btn-delete" data-id="${task.id}" title="Eliminar tarea" aria-label="Eliminar tarea">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                        </svg>
                    </button>
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
                <span class="task-card-user">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Usuario #${task.user_id ?? '—'}
                </span>
            </div>
        </article>
    `;
};

// ---------------------------------------------------------------
//                      RENDERIZADO
// ---------------------------------------------------------------

const renderTasks = () => {
    const container = document.querySelector('#tasks-container');
    if (!container) return;

    const filtered = activeFilter === 'all'
        ? allTasks
        : allTasks.filter(t => t.status === activeFilter);

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="tasks-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <p>No hay tareas ${activeFilter !== 'all' ? 'con este estado' : 'registradas'}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(taskCardHTML).join('');
    bindCardEvents();
};

// ---------------------------------------------------------------
//                          MODAL
// ---------------------------------------------------------------

const openModal = (task = null) => {
    const modal     = document.querySelector('#task-modal');
    const title     = document.querySelector('#modal-title');
    const idInput   = document.querySelector('#task-id');
    const titleInp  = document.querySelector('#task-title');
    const descInp   = document.querySelector('#task-description');
    const statusSel = document.querySelector('#task-status');

    document.querySelector('#title-error').classList.add('hidden');
    document.querySelector('#description-error').classList.add('hidden');

    if (task) {
        title.textContent   = 'Editar tarea';
        idInput.value       = task.id;
        titleInp.value      = task.title;
        descInp.value       = task.description;
        statusSel.value     = task.status;
    } else {
        title.textContent = 'Nueva tarea';
        idInput.value     = '';
        titleInp.value    = '';
        descInp.value     = '';
        statusSel.value   = 'pendiente';
    }

    modal.classList.remove('hidden');
};

const closeModal = () => {
    document.querySelector('#task-modal')?.classList.add('hidden');
};

// ---------------------------------------------------------------
//                        VALIDACIÓN
// ---------------------------------------------------------------

const validateForm = () => {
    const title = document.querySelector('#task-title').value.trim();
    const desc  = document.querySelector('#task-description').value.trim();
    let valid   = true;

    const titleError = document.querySelector('#title-error');
    const descError  = document.querySelector('#description-error');

    if (title.length < 5) {
        titleError.textContent = 'El título debe tener al menos 5 caracteres';
        titleError.classList.remove('hidden');
        valid = false;
    } else {
        titleError.classList.add('hidden');
    }

    if (desc.length < 5) {
        descError.textContent = 'La descripción debe tener al menos 5 caracteres';
        descError.classList.remove('hidden');
        valid = false;
    } else {
        descError.classList.add('hidden');
    }

    return valid;
};

// ---------------------------------------------------------------
//                     OPERACIONES CRUD
// ---------------------------------------------------------------

const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const taskId  = document.querySelector('#task-id').value;
    const title   = document.querySelector('#task-title').value.trim();
    const desc    = document.querySelector('#task-description').value.trim();
    const status  = document.querySelector('#task-status').value;
    const btnSave = document.querySelector('#btn-save');
    const user    = getCurrentUser();

    btnSave.disabled    = true;
    btnSave.textContent = 'Guardando...';

    try {
        let result;
        if (taskId) {
            result = await updateTaskPartial(taskId, { title, description: desc, status });
        } else {
            result = await createTask({
                user_id: user?.id,
                title,
                description: desc,
                status
            });
        }

        if (!result.success) {
            const msg = result.errors?.length
                ? `${result.message}: ${result.errors.map(e => e.message ?? e).join(', ')}`
                : result.message;
            showToast(msg, 'error');
            return;
        }

        showToast(result.message, 'success');
        closeModal();
        await loadTasks();

    } catch (err) {
        console.error('[ERROR] handleSave:', err.message);
        showToast('No se pudo procesar la solicitud', 'error');
    } finally {
        btnSave.disabled    = false;
        btnSave.textContent = 'Guardar';
    }
};

const handleDelete = async (taskId) => {
    const confirm = await Swal.fire({
        title: '¿Eliminar tarea?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#334155',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        background: '#1e293b',
        color: '#f1f5f9'
    });

    if (!confirm.isConfirmed) return;

    try {
        const result = await deleteTask(taskId);

        if (!result.success) {
            showToast(result.message || 'No se pudo eliminar la tarea', 'error');
            return;
        }

        showToast(result.message, 'success');
        await loadTasks();

    } catch (err) {
        console.error('[ERROR] handleDelete:', err.message);
        showToast('No se pudo procesar la solicitud', 'error');
    }
};

// ---------------------------------------------------------------
//                      CARGA DE DATOS
// ---------------------------------------------------------------

const loadTasks = async () => {
    const container = document.querySelector('#tasks-container');
    if (!container) return;

    container.innerHTML = `
        <div class="tasks-loading">
            <span class="loading-spinner"></span>
            Cargando tareas...
        </div>
    `;

    try {
        const result = await fetchTasks();

        // fetchTasks puede retornar el array directamente o un objeto con .data
        allTasks = Array.isArray(result) ? result : (result?.data ?? []);

        renderTasks();
    } catch (err) {
        console.error('[ERROR] loadTasks:', err.message);

        // Si fue un error de sesión, apiFetch ya redirigió. Solo limpiar el spinner.
        if (err.message?.toLowerCase().includes('sesión')) return;

        container.innerHTML = `
            <div class="tasks-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>No se pudieron cargar las tareas.</p>
                <button class="btn-retry" id="btn-retry">Reintentar</button>
            </div>
        `;
        document.querySelector('#btn-retry')?.addEventListener('click', loadTasks);
    }
};

// ---------------------------------------------------------------
//                   EVENTOS DE TARJETAS
// ---------------------------------------------------------------

const bindCardEvents = () => {
    const container = document.querySelector('#tasks-container');
    if (!container) return;

    // Remover listener previo clonando el nodo
    const fresh = container.cloneNode(true);
    container.replaceWith(fresh);

    fresh.addEventListener('click', (e) => {
        const btnEdit   = e.target.closest('.task-btn-edit');
        const btnDelete = e.target.closest('.task-btn-delete');

        if (btnEdit) {
            const id   = Number(btnEdit.dataset.id);
            const task = allTasks.find(t => t.id === id);
            if (task) openModal(task);
        }
        if (btnDelete) {
            handleDelete(Number(btnDelete.dataset.id));
        }
    });
};

// ---------------------------------------------------------------
//                       INIT PRINCIPAL
// ---------------------------------------------------------------

export const tasksInit = () => {

    loadTasks();

    document.querySelector('#btn-new-task')
        ?.addEventListener('click', () => openModal());

    document.querySelector('#modal-close')
        ?.addEventListener('click', closeModal);
    document.querySelector('#btn-cancel')
        ?.addEventListener('click', closeModal);
    document.querySelector('#modal-overlay')
        ?.addEventListener('click', closeModal);

    document.querySelector('#task-form')
        ?.addEventListener('submit', handleSave);

    document.querySelector('#tasks-filters')
        ?.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            renderTasks();
        });
};