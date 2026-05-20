// Importaciones
import './style.css'
import { initRouter } from './router/router'

window.addEventListener("hashchange", initRouter);
window.addEventListener('DOMContentLoaded', initRouter);