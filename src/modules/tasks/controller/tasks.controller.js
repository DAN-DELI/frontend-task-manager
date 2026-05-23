import Swal from 'sweetalert2';
import { fetchTasks, fetchMyTasks, createTask, updateTaskPartial, deleteTask } from '../../../api/index.js';
import { fetchUsers } from '../../../api/users.api.js';
import { showToast } from '../../../utils/index.js';
import { hasPermission } from '../../../utils/auth.utils.js';
import { taskCardHTML, usersChecklistHTML } from '../view/tasks.view.js';
import { navigateTo } from '../../../utils/navigation.js';

// ---------------------------------------------------------------
//                          ESTADO LOCAL
// ---------------------------------------------------------------
let myTasks = [];
let allTasks = [];
let allUsers = [];
let myTasksFilter = 'all';
let allTasksFilter = 'all';
let canAssign = false;
let showMyTasksSection = false;
let showAllTasksSection = false;

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

/** Devuelve los IDs de usuarios actualmente marcados en el checklist */
const getSelectedUserIds = () =>
    [...document.querySelectorAll('.checklist-checkbox:checked')]
        .map(cb => Number(cb.value));

/** Filtra usuarios que NO tienen rol 'admin' */
const filterNonAdmins = (users) =>
    users.filter(u =>
        !Array.isArray(u.roles) ||
        !u.roles.some(r => r.name?.toLowerCase() === 'admin')
    );

// ---------------------------------------------------------------
//                      RENDERIZADO
// ---------------------------------------------------------------

/**
 * Renderiza una sección específica de tareas
 * @param {string} section - 'my-tasks' o 'all-tasks'
 * @param {Array} tasks - Lista de tareas a renderizar
 * @param {string} filter - Filtro activo
 */
const renderTasksSection = (section, tasks, filter) => {
    const containerId = section === 'my-tasks' ? 'my-tasks-container' : 'all-tasks-container';
    const container = document.querySelector(`#${containerId}`);
    if (!container) return;

    const filtered = filter === 'all'
        ? tasks
        : tasks.filter(t => t.status === filter);

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="tasks-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <p>No hay tareas ${filter !== 'all' ? 'con este estado' : 'registradas'}</p>
            </div>
        `;
        return;
    }

    const canUpdate = hasPermission('tasks.update');
    const canDelete = hasPermission('tasks.delete');
    container.innerHTML = filtered.map(t => taskCardHTML(t, canUpdate, canDelete)).join('');
    bindCardEvents(section);
};

/**
 * Renderiza todas las secciones activas
 */
const renderAllTasks = () => {
    if (showMyTasksSection) {
        renderTasksSection('my-tasks', myTasks, myTasksFilter);
    }
    if (showAllTasksSection) {
        renderTasksSection('all-tasks', allTasks, allTasksFilter);
    }
};

// ---------------------------------------------------------------
//             CARGA Y RENDERIZADO DEL CHECKLIST
// ---------------------------------------------------------------

const loadUsersChecklist = async (selectedIds = []) => {
    const checklist = document.querySelector('#users-checklist');
    if (!checklist) return;

    // Usar caché si ya se cargaron en esta sesión
    if (allUsers.length === 0) {
        checklist.innerHTML = `
            <div class="users-checklist-loading">
                <span class="loading-spinner loading-spinner--sm"></span>
                Cargando usuarios...
            </div>
        `;
        try {
            const users = await fetchUsers();
            allUsers = filterNonAdmins(users);
        } catch (err) {
            console.error('[ERROR] loadUsersChecklist:', err.message);
            checklist.innerHTML = `<p class="checklist-empty">No se pudieron cargar los usuarios.</p>`;
            return;
        }
    }

    checklist.innerHTML = usersChecklistHTML(allUsers, selectedIds);
    updateToggleAllBtn();
    bindToggleAllBtn();
};

// ---------------------------------------------------------------
//           BOTÓN "SELECCIONAR TODOS / DESELECCIONAR TODOS"
// ---------------------------------------------------------------

const updateToggleAllBtn = () => {
    const btn = document.querySelector('#btn-toggle-all');
    const checkboxes = document.querySelectorAll('.checklist-checkbox');
    const checked = document.querySelectorAll('.checklist-checkbox:checked');
    if (!btn) return;
    btn.textContent = (checked.length === checkboxes.length && checkboxes.length > 0)
        ? 'Deseleccionar todos'
        : 'Seleccionar todos';
};

    const bindToggleAllBtn = () => {
    const btn = document.querySelector('#btn-toggle-all');
    if (!btn) return;

    // Clonar el botón para eliminar listeners previos acumulados
    const freshBtn = btn.cloneNode(true);
    btn.replaceWith(freshBtn);
    freshBtn.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.checklist-checkbox');
        const allChecked = [...checkboxes].every(cb => cb.checked);
        checkboxes.forEach(cb => { cb.checked = !allChecked; });
        updateToggleAllBtn();
    });

    document.querySelector('#users-checklist')
        ?.addEventListener('change', updateToggleAllBtn);
};

// ---------------------------------------------------------------
//                          MODAL
// ---------------------------------------------------------------

const openModal = async (task = null) => {
    const modal = document.querySelector('#task-modal');
    const title = document.querySelector('#modal-title');
    const idInput = document.querySelector('#task-id');
    const titleInp = document.querySelector('#task-title');
    const descInp = document.querySelector('#task-description');
    const statusSel = document.querySelector('#task-status');

    document.querySelector('#title-error').classList.add('hidden');
    document.querySelector('#description-error').classList.add('hidden');
    document.querySelector('#assign-error')?.classList.add('hidden');

    const selectedIds = task?.assigned_users?.map(u => u.id) ?? [];

    if (task) {
        title.textContent = 'Editar tarea';
        idInput.value = task.id;
        titleInp.value = task.title;
        descInp.value = task.description;
        statusSel.value = task.status;
        //Si es aprendiz le bloquea el titulo y la descripcion
        titleInp.disabled = !canAssign;
        descInp.disabled = !canAssign;
    } else {
        title.textContent = 'Nueva tarea';
        idInput.value = '';
        titleInp.value = '';
        descInp.value = '';
        statusSel.value = 'pendiente';
        titleInp.disabled = false;
        descInp.disabled = false;
    }

    modal.classList.remove('hidden');
    await loadUsersChecklist(selectedIds);
};

const closeModal = () => {
    document.querySelector('#task-modal')?.classList.add('hidden');
    history.replaceState(null, '', '#/tasks');
};

// ---------------------------------------------------------------
//                        VALIDACIÓN
// ---------------------------------------------------------------

const validateForm = () => {
    const title = document.querySelector('#task-title').value.trim();
    const desc = document.querySelector('#task-description').value.trim();
    let valid = true;

    const titleError = document.querySelector('#title-error');
    const descError = document.querySelector('#description-error');

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

    const taskId = document.querySelector('#task-id').value;
    const title = document.querySelector('#task-title').value.trim();
    const desc = document.querySelector('#task-description').value.trim();
    const status = document.querySelector('#task-status').value;
    const assigned_user_ids = getSelectedUserIds();
    const btnSave = document.querySelector('#btn-save');
    const user = getCurrentUser();

    btnSave.disabled = true;
    btnSave.textContent = 'Guardando...';

    try {
        let result;
        if (taskId) {
            result = await updateTaskPartial(taskId, { title, description: desc, status, assigned_user_ids });
        } else {
            result = await createTask({
                created_by: user?.id,
                title,
                description: desc,
                status,
                ...(canAssign && { assigned_user_ids })
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
        await loadAllData();

    } catch (err) {
        console.error('[ERROR] handleSave:', err.message);
        showToast('No se pudo procesar la solicitud', 'error');
    } finally {
        btnSave.disabled = false;
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
        await loadAllData();

    } catch (err) {
        console.error('[ERROR] handleDelete:', err.message);
        showToast('No se pudo procesar la solicitud', 'error');
    }
};

// ---------------------------------------------------------------
//                      CARGA DE DATOS
// ---------------------------------------------------------------

const loadMyTasksData = async () => {
    const container = document.querySelector('#my-tasks-container');
    if (!container) return;

    container.innerHTML = `
        <div class="tasks-loading">
            <span class="loading-spinner"></span>
            Cargando mis tareas...
        </div>
    `;

    try {
        const result = await fetchMyTasks();
        myTasks = Array.isArray(result) ? result : (result?.data ?? []);
        renderTasksSection('my-tasks', myTasks, myTasksFilter);
    } catch (err) {
        console.error('[ERROR] loadMyTasksData:', err.message);

        if (err.message?.toLowerCase().includes('sesión')) return;

        container.innerHTML = `
            <div class="tasks-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>No se pudieron cargar mis tareas.</p>
                <button class="btn-retry" id="btn-retry-my-tasks">Reintentar</button>
            </div>
        `;
        document.querySelector('#btn-retry-my-tasks')?.addEventListener('click', loadMyTasksData);
    }
};

const loadAllTasksData = async () => {
    const container = document.querySelector('#all-tasks-container');
    if (!container) return;

    container.innerHTML = `
        <div class="tasks-loading">
            <span class="loading-spinner"></span>
            Cargando todas las tareas...
        </div>
    `;

    try {
        const result = await fetchTasks();
        allTasks = Array.isArray(result) ? result : (result?.data ?? []);
        renderTasksSection('all-tasks', allTasks, allTasksFilter);
    } catch (err) {
        console.error('[ERROR] loadAllTasksData:', err.message);

        if (err.message?.toLowerCase().includes('sesión')) return;

        container.innerHTML = `
            <div class="tasks-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>No se pudieron cargar las tareas.</p>
                <button class="btn-retry" id="btn-retry-all-tasks">Reintentar</button>
            </div>
        `;
        document.querySelector('#btn-retry-all-tasks')?.addEventListener('click', loadAllTasksData);
    }
};

/**
 * Carga todos los datos según las secciones activas
 */
const loadAllData = async () => {
    const promises = [];
    if (showMyTasksSection) {
        promises.push(loadMyTasksData());
    }
    if (showAllTasksSection) {
        promises.push(loadAllTasksData());
    }
    await Promise.all(promises);
};

// ---------------------------------------------------------------
//                   EVENTOS DE TARJETAS
// ---------------------------------------------------------------

const bindCardEvents = (section) => {
    const containerId = section === 'my-tasks' ? 'my-tasks-container' : 'all-tasks-container';
    const container = document.querySelector(`#${containerId}`);
    if (!container) return;

    // Remover listener previo clonando el nodo
    const fresh = container.cloneNode(true);
    container.replaceWith(fresh);

    fresh.addEventListener('click', (e) => {
        const btnEdit = e.target.closest('.task-btn-edit');
        const btnDelete = e.target.closest('.task-btn-delete');

        if (btnEdit) {
            const id = Number(btnEdit.dataset.id);
            history.pushState(null, '', `#/tasks/${id}/edit`);
            // Buscar en ambas listas
            const task = myTasks.find(t => t.id === id) || allTasks.find(t => t.id === id);
            if (task) openModal(task);
        }
        if (btnDelete) {
            handleDelete(Number(btnDelete.dataset.id));
        }
    });
};

// ---------------------------------------------------------------
//                   EVENTOS DE FILTROS
// ---------------------------------------------------------------

const bindFilterEvents = () => {
    // Filtros de Mis Tareas
    if (showMyTasksSection) {
        const myFilters = document.querySelector('#my-tasks-filters');
        if (myFilters) {
            myFilters.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-btn');
                if (!btn) return;
                // Remover active de todos los botones de esta sección
                myFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                myTasksFilter = btn.dataset.filter;
                renderTasksSection('my-tasks', myTasks, myTasksFilter);
            });
        }
    }

    // Filtros de Todas las Tareas
    if (showAllTasksSection) {
        const allFilters = document.querySelector('#all-tasks-filters');
        if (allFilters) {
            allFilters.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-btn');
                if (!btn) return;
                // Remover active de todos los botones de esta sección
                allFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                allTasksFilter = btn.dataset.filter;
                renderTasksSection('all-tasks', allTasks, allTasksFilter);
            });
        }
    }
};

// ---------------------------------------------------------------
//                       INIT PRINCIPAL
// ---------------------------------------------------------------

//                      EXPORTAR TAREAS

const exportTasks = () => {
    const filtered = activeFilter === 'all'
        ? allTasks
        : allTasks.filter(t => t.status === activeFilter);

    if (filtered.length === 0) {
        showToast('No hay tareas para exportar', 'error');
        return;
    }

    const data = filtered.map(t => ({
        id:             t.id,
        title:          t.title,
        description:    t.description,
        status:         t.status,
        created_at:     t.created_at,
        assigned_users: (t.assigned_users ?? []).map(u => ({ id: u.id, name: u.name }))
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');

    const filterLabel = activeFilter === 'all' ? 'todas' : activeFilter;
    a.href     = url;
    a.download = `tareas-${filterLabel}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`${filtered.length} tarea(s) exportada(s)`, 'success');
};

export const tasksInit = async (params = {}) => {

    // Determinar qué secciones mostrar según permisos
    showMyTasksSection = hasPermission('tasks.view.own');
    showAllTasksSection = hasPermission('tasks.view');
    canAssign = hasPermission('tasks.create');

    // Cargar datos de las secciones activas
    await loadAllData();

    // Si viene con id en la URL, abrir directamente el modal de edición
    if (params.id) {
        const task = myTasks.find(t => t.id === Number(params.id)) || allTasks.find(t => t.id === Number(params.id));
        if (task) openModal(task);
    }

    document.querySelector('#btn-new-task')
    ?.addEventListener('click', () => {
    history.pushState(null, '', '#/tasks/create');
    openModal();
    });

    document.querySelector('#btn-export-tasks')
        ?.addEventListener('click', exportTasks);
    document.querySelector('#modal-close')
        ?.addEventListener('click', closeModal);
    document.querySelector('#btn-cancel')
        ?.addEventListener('click', closeModal);
    document.querySelector('#modal-overlay')
        ?.addEventListener('click', closeModal);

    document.querySelector('#task-form')
        ?.addEventListener('submit', handleSave);

    // Bind eventos de filtros
    bindFilterEvents();
};