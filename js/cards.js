// ================================
// NETFLIX-STYLE CARDS & ROWS
// ================================

import { IMG_PATH, apiPaths } from "./config.js";

const VISIBLE_COUNT = 8;
const sectionState = new Map();

/* Utility */
function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/* Fetch categories */
export async function fetchAndBuildAllSections() {
    const res = await fetch(apiPaths.fetchAllCategories);
    const data = await res.json();

    for (const genre of data.genres) {
        await fetchAndBuildMovieSection(
            apiPaths.fetchMoviesList(genre.id),
            genre.name
        );
    }
}

/* Fetch movies */
async function fetchAndBuildMovieSection(url, categoryName) {
    const res = await fetch(url);
    const data = await res.json();

    const movies = (data.results || []).filter(m => m.backdrop_path);
    if (!movies.length) return;

    buildMoviesSection(movies.slice(0, 20), categoryName);
}

/* Build section */
function buildMoviesSection(movies, categoryName) {
    const moviesCont = document.getElementById("movies-cont");
    const sectionId = slugify(categoryName);

    sectionState.set(sectionId, movies);

    const section = document.createElement("div");
    section.className = "movies-section";
    section.innerHTML = `
        <h2 class="movie-section-heading">${categoryName} <span>Explore All</span></h2>
        <div class="movies-row" id="${sectionId}"></div>
    `;

    moviesCont.appendChild(section);
    renderSection(sectionId);
}

/* Render cards */
function renderSection(sectionId) {
    const row = document.getElementById(sectionId);
    const movies = sectionState.get(sectionId);

    row.innerHTML = movies.slice(0, VISIBLE_COUNT).map(movie => `
        <div class="movie-card" onclick="openCardModal(${movie.id}, 'movie')">
            <img 
                loading="lazy"
                src="${IMG_PATH}${movie.backdrop_path}" 
                alt="${movie.title || movie.name}" 
            />

            <div class="card-hover">
                <div class="card-title">${movie.title || movie.name}</div>
                <div class="card-actions">
                    <button>▶</button>
                    <button>＋</button>
                    <button>👍</button>
                </div>
            </div>
        </div>
    `).join("");
}
