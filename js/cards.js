// Movie Cards and Sections
import { IMG_PATH, apiPaths } from './config.js';
import { selectBestTrailer, getCachedTrailer, cacheTrailer } from './utils.js';

// Maintain circular slider state per category
const sectionState = new Map();
const VISIBLE_COUNT = 6;

/**
 * Create a slug for IDs
 */
function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'section';
}

/**
 * Fetch all categories and build movie sections
 */
export async function fetchAndBuildAllSections() {
    try {
        const res = await fetch(apiPaths.fetchAllCategories);
        const data = await res.json();
        const categories = data.genres;
        
        if (Array.isArray(categories) && categories.length) {
            for (const category of categories) {
                await fetchAndBuildMovieSection(
                    apiPaths.fetchMoviesList(category.id),
                    category.name
                );
            }
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * Fetch movies for a specific category and build section with circular slider
 */
async function fetchAndBuildMovieSection(fetchUrl, categoryName) {
    console.log(fetchUrl, categoryName);
    
    try {
        const res = await fetch(fetchUrl);
        const data = await res.json();
        const movies = (data.results || []).filter(m => m && m.backdrop_path);

        if (movies.length) {
            // Check a larger batch to improve chances of trailer availability
            const batch = movies.slice(0, 30);

            // Keep only items that actually have a trailer available
            const withTrailers = (await Promise.all(batch.map(ensureHasTrailer))).filter(Boolean);

            if (withTrailers.length) {
                const toRender = withTrailers.slice(0, Math.max(VISIBLE_COUNT + 2, 12));
                buildMoviesSection(toRender, categoryName);
            } else {
                console.warn(`No trailer-capable titles for ${categoryName}`);
            }
        }
        
        return movies;
    } catch (err) {
        console.error(err);
    }
}

/**
 * Check whether a movie/TV item has an available YouTube trailer (with caching)
 */
async function ensureHasTrailer(item) {
    if (!item || !item.id) return null;
    const mediaType = item.media_type === 'tv' ? 'tv' : 'movie';
    
    // Check cache first
    const cached = getCachedTrailer(item.id, mediaType);
    if (cached !== undefined) {
        return cached ? item : null;
    }
    
    const url = mediaType === 'tv' ? apiPaths.fetchTvVideos(item.id) : apiPaths.fetchMovieVideos(item.id);
    try {
        const res = await fetch(url);
        const data = await res.json();
        const trailer = selectBestTrailer(data.results);
        
        // Cache the result
        cacheTrailer(item.id, mediaType, trailer ? trailer.key : null);
        
        return trailer ? item : null;
    } catch (err) {
        console.error('Error checking trailer for', mediaType, item.id, err);
        cacheTrailer(item.id, mediaType, null);
        return null;
    }
}

/**
 * Build a movie section with circular slider controls
 */
function buildMoviesSection(list, categoryName) {
    console.log(list, categoryName);
    
    const moviesCont = document.getElementById('movies-cont');
    const sectionId = `sec-${slugify(categoryName)}`;
    sectionState.set(sectionId, { items: [...list], categoryName });

    const moviesSectionHTML = `
        <div class="section-header">
            <h2 class="movie-section-heading">${categoryName} <span class="explore-nudge">Explore All</span></h2>
            <div class="slider-nav">
                <button class="slider-btn prev" data-section="${sectionId}" aria-label="Previous">&#10094;</button>
                <button class="slider-btn next" data-section="${sectionId}" aria-label="Next">&#10095;</button>
            </div>
        </div>
        <div class="movies-row" id="${sectionId}-row"></div>
    `;
    
    const div = document.createElement('div');
    div.className = "movies-section";
    div.id = sectionId;
    div.innerHTML = moviesSectionHTML;
    moviesCont.append(div);

    renderSection(sectionId);
    attachNavHandlers(sectionId);
}

/**
 * Render visible window of a section
 */
function renderSection(sectionId) {
    const state = sectionState.get(sectionId);
    if (!state) return;

    const row = document.getElementById(`${sectionId}-row`);
    if (!row) return;

    const slice = state.items.slice(0, VISIBLE_COUNT);

    const html = slice.map(item => {
        const movieId = item.id;
        const title = item.title || item.name || 'Unknown';
        const backdropPath = item.backdrop_path || '';
        const mediaType = item.media_type || 'movie';
        return `
            <div class="movie-item" data-movie-id="${movieId}" data-media-type="${mediaType}"
                 onclick="openCardModal(${movieId}, '${mediaType}')">
                <img decoding="async" class="move-item-img" src="${IMG_PATH}${backdropPath}" alt="${title}" />
                <div class="movie-title-overlay">${title}</div>
            </div>`;
    }).join('');

    row.innerHTML = html;
}

/**
 * Rotate forward (next) or backward (prev) and re-render
 */
function rotateSection(sectionId, direction = 'next') {
    const state = sectionState.get(sectionId);
    if (!state || state.items.length <= 1) return;

    if (direction === 'next') {
        const first = state.items.shift();
        state.items.push(first);
    } else {
        const last = state.items.pop();
        state.items.unshift(last);
    }

    sectionState.set(sectionId, state);
    renderSection(sectionId);

    const row = document.getElementById(`${sectionId}-row`);
    if (row) {
        const animClass = direction === 'next' ? 'slide-next' : 'slide-prev';
        row.classList.remove('slide-next', 'slide-prev');
        void row.offsetWidth; // force reflow to restart animation
        row.classList.add(animClass);
        setTimeout(() => row.classList.remove(animClass), 250);
    }
}

/**
 * Attach navigation handlers (buttons + wheel)
 */
function attachNavHandlers(sectionId) {
    const prevBtn = document.querySelector(`.slider-btn.prev[data-section="${sectionId}"]`);
    const nextBtn = document.querySelector(`.slider-btn.next[data-section="${sectionId}"]`);
    const row = document.getElementById(`${sectionId}-row`);

    if (prevBtn) prevBtn.addEventListener('click', () => rotateSection(sectionId, 'prev'));
    if (nextBtn) nextBtn.addEventListener('click', () => rotateSection(sectionId, 'next'));

    // Wheel-based looping inside the row
    if (row) {
        row.addEventListener('wheel', (e) => {
            e.preventDefault();
            const dir = e.deltaY > 0 || e.deltaX > 0 ? 'next' : 'prev';
            rotateSection(sectionId, dir);
        }, { passive: false });
    }
}
