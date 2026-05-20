// Importaciones
import './style.css'
import { initRouter } from './router/router'

// Aplicar tema guardado al arrancar la app
const savedTheme = localStorage.getItem('tm_theme') ?? 'dark';
document.body.classList.remove(
    'light-theme',
    'theme-midnight',
    'theme-forest',
    'theme-sunset',
    'theme-lavender',
    'theme-ocean',
    'theme-rose',
    'theme-mocha'
);
if (savedTheme === 'light')    document.body.classList.add('light-theme');
if (savedTheme === 'midnight') document.body.classList.add('theme-midnight');
if (savedTheme === 'forest')   document.body.classList.add('theme-forest');
if (savedTheme === 'sunset')   document.body.classList.add('theme-sunset');
if (savedTheme === 'lavender') document.body.classList.add('theme-lavender');
if (savedTheme === 'ocean')    document.body.classList.add('theme-ocean');
if (savedTheme === 'rose')     document.body.classList.add('theme-rose');
if (savedTheme === 'mocha')    document.body.classList.add('theme-mocha');

window.addEventListener("hashchange", initRouter);
window.addEventListener('DOMContentLoaded', initRouter);