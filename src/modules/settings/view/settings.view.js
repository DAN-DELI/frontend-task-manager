export const settingsView = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return `
    <section class="settings-page">

        <div class="settings-header">
            <h1 class="page-title">Configuraciones</h1>
            <p class="page-subtitle">Administra tu perfil y preferencias</p>
        </div>

        <div class="settings-grid">

            <!--               CARD: EDITAR PERFIL                -->

            <div class="settings-card">
                <div class="settings-card-header">
                    <div class="settings-card-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <div>
                        <h2 class="settings-card-title">Perfil personal</h2>
                        <p class="settings-card-subtitle">Actualiza tu nombre y correo electrónico</p>
                    </div>
                </div>

                <form id="profile-form" class="settings-form">
                    <div class="input-group">
                        <label for="profile-name">Nombre</label>
                        <div class="input-wrapper">
                            <input type="text" id="profile-name" value="${user.name ?? ''}" placeholder="Tu nombre completo" />
                        </div>
                        <span class="error-message hidden" id="profile-name-error"></span>
                    </div>

                    <div class="input-group">
                        <label for="profile-email">Correo electrónico</label>
                        <div class="input-wrapper">
                            <input type="email" id="profile-email" value="${user.email ?? ''}" placeholder="tu@correo.com" />
                        </div>
                        <span class="error-message hidden" id="profile-email-error"></span>
                    </div>

                    <div class="input-group">
                        <label for="profile-document">Documento</label>
                        <div class="input-wrapper">
                            <input type="text" id="profile-document" value="${user.document ?? ''}" disabled class="input-disabled" />
                        </div>
                        <span class="input-hint">El documento no puede modificarse</span>
                    </div>

                    <div class="settings-form-actions">
                        <button type="submit" class="btn-primary btn-settings" id="btn-save-profile">
                            Guardar cambios
                        </button>
                    </div>
                </form>
            </div>

            <!--            CARD: CAMBIAR CONTRASEÑA              -->

            <div class="settings-card">
                <div class="settings-card-header">
                    <div class="settings-card-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="settings-card-title">Cambiar contraseña</h2>
                        <p class="settings-card-subtitle">Ingresa tu contraseña actual y define una nueva</p>
                    </div>
                </div>

                <form id="password-form" class="settings-form">
                    <div class="input-group">
                        <label for="current-password">Contraseña actual</label>
                        <div class="input-wrapper input-password">
                            <input type="password" id="current-password" placeholder="••••••••" />
                            <button type="button" class="btn-toggle-password" data-target="current-password" aria-label="Mostrar contraseña">
                                <svg class="icon-eye" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </div>
                        <span class="error-message hidden" id="current-password-error"></span>
                    </div>

                    <div class="input-group">
                        <label for="new-password">Nueva contraseña</label>
                        <div class="input-wrapper input-password">
                            <input type="password" id="new-password" placeholder="••••••••" />
                            <button type="button" class="btn-toggle-password" data-target="new-password" aria-label="Mostrar contraseña">
                                <svg class="icon-eye" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </div>
                        <span class="error-message hidden" id="new-password-error"></span>
                    </div>

                    <div class="input-group">
                        <label for="confirm-password">Confirmar nueva contraseña</label>
                        <div class="input-wrapper input-password">
                            <input type="password" id="confirm-password" placeholder="••••••••" />
                            <button type="button" class="btn-toggle-password" data-target="confirm-password" aria-label="Mostrar contraseña">
                                <svg class="icon-eye" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </div>
                        <span class="error-message hidden" id="confirm-password-error"></span>
                    </div>

                    <div class="settings-form-actions">
                        <button type="submit" class="btn-primary btn-settings" id="btn-save-password">
                            Cambiar contraseña
                        </button>
                    </div>
                </form>
            </div>

            <!--              CARD: APARIENCIA                    -->

            <div class="settings-card settings-card-appearance">
                <div class="settings-card-header">
                    <div class="settings-card-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    </div>
                    <div>
                        <h2 class="settings-card-title">Apariencia</h2>
                        <p class="settings-card-subtitle">Personaliza el tema de la aplicación</p>
                    </div>
                </div>

                <div class="theme-toggle-wrapper">
                    <div class="theme-option" id="theme-dark">
                        <div class="theme-preview theme-preview-dark">
                            <div class="preview-bar"></div>
                            <div class="preview-content">
                                <div class="preview-line"></div>
                                <div class="preview-line short"></div>
                            </div>
                        </div>
                        <span>Oscuro</span>
                    </div>
                    <div class="theme-option" id="theme-light">
                        <div class="theme-preview theme-preview-light">
                            <div class="preview-bar"></div>
                            <div class="preview-content">
                                <div class="preview-line"></div>
                                <div class="preview-line short"></div>
                            </div>
                        </div>
                        <span>Claro</span>
                    </div>
                    <div class="theme-option" id="theme-midnight">
                        <div class="theme-preview theme-preview-midnight">
                            <div class="preview-bar"></div>
                            <div class="preview-content">
                                <div class="preview-line"></div>
                                <div class="preview-line short"></div>
                            </div>
                        </div>
                        <span>Midnight</span>
                    </div>

                    <div class="theme-option" id="theme-forest">
                        <div class="theme-preview theme-preview-forest">
                            <div class="preview-bar"></div>
                            <div class="preview-content">
                                <div class="preview-line"></div>
                                <div class="preview-line short"></div>
                            </div>
                        </div>
                        <span>Forest</span>
                    </div>

                    <div class="theme-option" id="theme-sunset">
                        <div class="theme-preview theme-preview-sunset">
                            <div class="preview-bar"></div>
                            <div class="preview-content">
                                <div class="preview-line"></div>
                                <div class="preview-line short"></div>
                            </div>
                        </div>
                        <span>Sunset</span>
                    </div>

                    <div class="theme-option" id="theme-lavender">
                        <div class="theme-preview theme-preview-lavender">
                            <div class="preview-bar"></div>
                            <div class="preview-content">
                                <div class="preview-line"></div>
                                <div class="preview-line short"></div>
                            </div>
                        </div>
                        <span>Lavender</span>
                    </div>

                                        <div class="theme-option" id="theme-ocean">
                        <div class="theme-preview theme-preview-ocean">
                            <div class="preview-bar"></div>
                            <div class="preview-content">
                                <div class="preview-line"></div>
                                <div class="preview-line short"></div>
                            </div>
                        </div>
                        <span>Ocean</span>
                    </div>

                    <div class="theme-option" id="theme-rose">
                        <div class="theme-preview theme-preview-rose">
                            <div class="preview-bar"></div>
                            <div class="preview-content">
                                <div class="preview-line"></div>
                                <div class="preview-line short"></div>
                            </div>
                        </div>
                        <span>Rose</span>
                    </div>

                    <div class="theme-option" id="theme-mocha">
                        <div class="theme-preview theme-preview-mocha">
                            <div class="preview-bar"></div>
                            <div class="preview-content">
                                <div class="preview-line"></div>
                                <div class="preview-line short"></div>
                            </div>
                        </div>
                        <span>Mocha</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `;
};