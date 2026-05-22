import Swal from 'sweetalert2';
import { fetchTasks, createTask, updateTaskPartial, deleteTask } from '../../../api/index.js';
import { showToast } from '../../../utils/index.js';
import { hasPermission } from '../../../utils/auth.utils.js';
import { taskCardHTML } from '../view/tasks.view.js';

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

    const canUpdate = hasPermission('tasks.update');
    const canDelete = hasPermission('tasks.delete');
    container.innerHTML = filtered.map(t => taskCardHTML(t, canUpdate, canDelete)).join('');
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

    const btnNewTask = document.querySelector('#btn-new-task');
    if (btnNewTask) {
        if (!hasPermission('tasks.create')) {
            btnNewTask.style.display = 'none';
        } else {
            btnNewTask.addEventListener('click', () => openModal());
        }
    }

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