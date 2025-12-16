// Main Application Entry Point
import { fetchTrendingMovies } from './hero.js';
import { fetchAndBuildAllSections } from './cards.js';
import { initModalListeners } from './modal.js';

/**
 * Initialize the application
 */
function init() {
    fetchTrendingMovies();
    fetchAndBuildAllSections();
}

/**
 * Initialize header scroll effect
 */
function initHeaderScroll() {
    window.addEventListener('scroll', function() {
        const header = document.getElementById('header');
        if (window.scrollY > 5) header.classList.add('black-bg');
        else header.classList.remove('black-bg');
    });
}

/**
 * Bootstrap application when DOM is loaded
 */
window.addEventListener('load', function() {
    init();
    initModalListeners();
    initHeaderScroll();
});
