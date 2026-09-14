export const forbiddenView = () => `
    <section class="error-section">
        <div class="error-card">
            <div class="error-icon error-icon--403">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    <line x1="12" y1="16" x2="12" y2="16.01"></line>
                </svg>
            </div>
            <h2 class="error-code">403</h2>
            <h3 class="error-title">Acceso restringido</h3>
            <p class="error-message">
                No tienes los permisos necesarios para ver esta sección.
                Contacta a tu administrador si crees que esto es un error.
            </p>
            <a href="#/home" class="btn btn--primary">Volver al inicio</a>
        </div>
    </section>
`;