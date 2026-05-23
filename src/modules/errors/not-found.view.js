export const notFoundView = () => `
    <section class="error-section">
        <div class="error-card">
            <div class="error-icon error-icon--404">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="11"></line>
                    <line x1="11" y1="14" x2="11.01" y2="14"></line>
                </svg>
            </div>
            <h2 class="error-code">404</h2>
            <h3 class="error-title">Página no encontrada</h3>
            <p class="error-message">
                La ruta que intentas acceder no existe o fue eliminada.
            </p>
            <a href="#/home" class="btn btn--primary">Volver al inicio</a>
        </div>
    </section>
`;