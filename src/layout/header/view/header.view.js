export const headerLayout = (navItemsHtml = '') => {
  return `
    <header class="header">
      <div class="header-container">
        <div class="header-brand">
          <span class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          <h1 class="brand-title">Task Manager</h1>
        </div>
        
        <nav class="header-nav">
          <ul class="nav-list">
            ${navItemsHtml}
          </ul>
        </nav>
        
        <div class="header-actions">
          <button class="btn-logout" id="btn-logout" type="button">
            <span class="logout-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
            <span class="logout-text">Salir</span>
          </button>
        </div>
      </div>
    </header>

    <main id="main-content"></main>
  `;
};