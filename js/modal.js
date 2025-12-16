// Modal Management
import { apiPaths } from './config.js';
import { selectBestTrailer } from './utils.js';
import { pauseHeroVideo } from './hero.js';

function showModal(mode = 'details') {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalVideoSection = document.getElementById('modal-video-section');
    const modalDetailsSection = document.getElementById('modal-details-section');
    if (!modalOverlay || !modalVideoSection || !modalDetailsSection) return;

    // Toggle sections
    if (mode === 'video') {
        modalVideoSection.style.display = 'flex';
        modalDetailsSection.style.display = 'none';
    } else if (mode === 'both') {
        modalVideoSection.style.display = 'flex';
        modalDetailsSection.style.display = 'block';
    } else {
        modalDetailsSection.style.display = 'block';
        modalVideoSection.style.display = 'none';
    }

    // Ensure overlay becomes visible even if CSS was overridden
    modalOverlay.style.display = 'flex';
    modalOverlay.classList.add('show');
}

function hideModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (!modalOverlay) return;
    modalOverlay.classList.remove('show');
    modalOverlay.style.display = 'none';
}

/**
 * Open the modal with video player for Play button
 */
export function openPlayModal(movieId, mediaType) {
    // Pause hero video when modal video opens
    pauseHeroVideo();

    const modalVideoSection = document.getElementById('modal-video-section');
    const modalTrailerIframe = document.getElementById('modal-trailer-iframe');
    const modalVideoFallback = document.getElementById('modal-video-fallback');
    if (modalVideoSection) modalVideoSection.style.display = 'flex';
    if (modalVideoFallback) {
        modalVideoFallback.textContent = '';
        modalVideoFallback.style.display = 'none';
    }
    if (modalTrailerIframe) modalTrailerIframe.src = '';

    // Fetch video and populate iframe
    const videoUrl = mediaType === 'tv' ? apiPaths.fetchTvVideos(movieId) : apiPaths.fetchMovieVideos(movieId);
    fetch(videoUrl)
        .then(res => res.json())
        .then(data => {
            const iframeEl = document.getElementById('modal-trailer-iframe');
            const fallbackEl = document.getElementById('modal-video-fallback');
            const trailer = selectBestTrailer(data.results);
            if (trailer) {
                const youtubeUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&controls=1`;
                if (iframeEl) iframeEl.src = youtubeUrl;
                if (fallbackEl) fallbackEl.style.display = 'none';
                console.log('Playing trailer:', youtubeUrl);
            } else {
                if (iframeEl) {
                    iframeEl.src = '';
                    iframeEl.setAttribute('title', 'No trailer available');
                }
                if (fallbackEl) {
                    fallbackEl.textContent = 'Trailer not available for this title.';
                    fallbackEl.style.display = 'block';
                }
                console.log('No trailer found for', mediaType, movieId);
            }
        })
        .catch(err => console.error('Error in openPlayModal:', err));

    // Show modal
    showModal('video');
}

/**
 * Open the modal with movie details for More Info button
 */
export function openMoreInfoModal(movieId, mediaType) {
    // Fetch details and credits
    const detailsUrl = mediaType === 'tv' ? apiPaths.fetchTvDetails(movieId) : apiPaths.fetchMovieDetails(movieId);
    const creditsUrl = mediaType === 'tv' ? apiPaths.fetchTvCredits(movieId) : apiPaths.fetchMovieCredits(movieId);
    
    Promise.all([
        fetch(detailsUrl).then(res => res.json()),
        fetch(creditsUrl).then(res => res.json())
    ])
    .then(([movieData, creditsData]) => {
        populateMovieDetails(movieData, creditsData);
    })
    .catch(err => console.error('Error in openMoreInfoModal:', err));

    // Show modal
    showModal('details');
}

/**
 * Populate modal with movie/TV details
 */
function populateMovieDetails(movieData, creditsData) {
    const modalTitle = document.getElementById('modal-movie-title');
    const modalOverview = document.getElementById('modal-movie-overview');
    const modalCast = document.getElementById('modal-movie-cast');
    const modalRating = document.getElementById('modal-movie-rating');
    const modalGenre = document.getElementById('modal-movie-genre');
    const modalYear = document.getElementById('modal-movie-year');
    
    // Handle both movie and TV show data
    const title = movieData.title || movieData.name || 'Unknown';
    const year = movieData.release_date ? new Date(movieData.release_date).getFullYear() : 
                 movieData.first_air_date ? new Date(movieData.first_air_date).getFullYear() : 'N/A';
    const rating = movieData.vote_average ? movieData.vote_average.toFixed(1) : 'N/A';
    const genres = movieData.genres ? movieData.genres.map(g => g.name).join(', ') : 'N/A';
    
    modalTitle.textContent = title;
    if (modalRating) modalRating.textContent = `⭐ ${rating}`;
    if (modalGenre) modalGenre.textContent = genres;
    if (modalYear) modalYear.textContent = year;
    if (modalOverview) modalOverview.textContent = movieData.overview || 'No overview available';
    
    // Populate cast
    if (creditsData.cast && creditsData.cast.length) {
        const castHTML = creditsData.cast.slice(0, 10).map(actor => `
            <span class="cast-member">${actor.name}</span>
        `).join('');
        modalCast.innerHTML = castHTML;
    } else {
        modalCast.innerHTML = 'Not available';
    }
}

/**
 * Close the modal
 */
export function closeModal() {
    const modalTrailerIframe = document.getElementById('modal-trailer-iframe');
    const modalVideoFallback = document.getElementById('modal-video-fallback');
    
    // Stop video playback
    if (modalTrailerIframe) modalTrailerIframe.src = '';
    if (modalVideoFallback) modalVideoFallback.textContent = '';

    hideModal();
}

/**
 * Open modal when card is clicked - shows More Info with details and cast
 */
export function openCardModal(movieId, mediaType) {
    console.log(`Opening modal for ${mediaType} ${movieId}`);

    // Pause hero video when modal opens
    pauseHeroVideo();

    const iframeEl = document.getElementById('modal-trailer-iframe');
    const fallbackEl = document.getElementById('modal-video-fallback');
    if (iframeEl) iframeEl.src = '';
    if (fallbackEl) {
        fallbackEl.textContent = '';
        fallbackEl.style.display = 'none';
    }

    // Show both sections (video + details)
    showModal('both');

    const videoUrl = mediaType === 'tv' ? apiPaths.fetchTvVideos(movieId) : apiPaths.fetchMovieVideos(movieId);
    const detailsUrl = mediaType === 'tv' ? apiPaths.fetchTvDetails(movieId) : apiPaths.fetchMovieDetails(movieId);
    const creditsUrl = mediaType === 'tv' ? apiPaths.fetchTvCredits(movieId) : apiPaths.fetchMovieCredits(movieId);

    Promise.all([
        fetch(videoUrl).then(res => res.json()),
        fetch(detailsUrl).then(res => res.json()),
        fetch(creditsUrl).then(res => res.json())
    ])
    .then(([videoData, movieData, creditsData]) => {
        // Handle trailer
        const trailer = selectBestTrailer(videoData.results);
        if (trailer) {
            const youtubeUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&controls=1`;
            if (iframeEl) iframeEl.src = youtubeUrl;
            if (fallbackEl) fallbackEl.style.display = 'none';
            console.log('Playing trailer:', youtubeUrl);
        } else {
            if (iframeEl) {
                iframeEl.src = '';
                iframeEl.setAttribute('title', 'No trailer available');
            }
            if (fallbackEl) {
                fallbackEl.textContent = 'Trailer not available for this title.';
                fallbackEl.style.display = 'block';
            }
            console.log('No trailer found for', mediaType, movieId);
        }

        // Populate details
        populateMovieDetails(movieData, creditsData);
    })
    .catch(err => console.error('Error loading card modal:', err));
}

/**
 * Initialize modal event listeners
 */
export function initModalListeners() {
    // Close modal on X button
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close modal on overlay click (outside modal)
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
    
    // Wire banner Play and More Info buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.banner-play-btn')) {
            const btn = e.target.closest('.banner-play-btn');
            const movieId = btn.dataset.movieId;
            const mediaType = btn.dataset.mediaType || 'movie';
            openPlayModal(parseInt(movieId), mediaType);
        }
        if (e.target.closest('.banner-info-btn')) {
            const btn = e.target.closest('.banner-info-btn');
            const movieId = btn.dataset.movieId;
            const mediaType = btn.dataset.mediaType || 'movie';
            openMoreInfoModal(parseInt(movieId), mediaType);
        }
    });
}

// Expose openCardModal to global scope for onclick handlers
window.openCardModal = openCardModal;
window.openPlayModal = openPlayModal;
window.openMoreInfoModal = openMoreInfoModal;
