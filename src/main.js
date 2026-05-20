// Importaciones
import './style.css'
import { initRouter } from './router/router'

// Aplicar tema guardado al arrancar la app
const savedTheme = localStorage.getItem('tm_theme') ?? 'dark';
document.body.classList.toggle('light-theme', savedTheme === 'light');

window.addEventListener("hashchange", initRouter);
window.addEventListener('DOMContentLoaded', initRouter);