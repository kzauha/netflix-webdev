// Hero/Banner Section Management
import { IMG_PATH, apiPaths } from './config.js';
import { fetchItemTrailerKey } from './utils.js';

let heroPlayer = null;

/**
 * Initialize YouTube IFrame API for hero video
 */
export function onYouTubeIframeAPIReady() {
    initHeroPlayer();
}

function initHeroPlayer() {
    if (heroPlayer) return;
    if (!window.YT || !YT.Player) return;
    
    const heroIframe = document.getElementById('hero-video');
    if (!heroIframe || !heroIframe.src) {
        console.log('Hero iframe not ready yet');
        return;
    }
    
    try {
        heroPlayer = new YT.Player('hero-video', {
            events: {
                onReady: function(event) {
                    console.log('Hero player ready');
                },
                onError: function(event) {
                    console.error('Hero player error:', event.data);
                }
            }
        });
    } catch (e) {
        console.error('Failed to initialize hero player:', e);
    }
}

/**
 * Pause the hero video when other videos play
 */
export function pauseHeroVideo() {
    try {
        // Try using YouTube IFrame API first
        if (heroPlayer && heroPlayer.pauseVideo) {
            heroPlayer.pauseVideo();
            console.log('Hero video paused via API');
            return;
        }
    } catch (e) {
        console.warn('YT API pause failed:', e);
    }
    
    // Fallback: stop the iframe by removing and restoring src with paused state
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo && heroVideo.src) {
        const currentSrc = heroVideo.src;
        // Stop video by replacing autoplay=1 with autoplay=0
        if (currentSrc.includes('autoplay=1')) {
            heroVideo.src = currentSrc.replace('autoplay=1', 'autoplay=0');
            console.log('Hero video paused via src modification');
        }
    }
}

/**
 * Fetch trending movies and build hero banner
 */
export async function fetchTrendingMovies() {
    try {
        const res = await fetch(apiPaths.fetchTrending);
        const data = await res.json();
        const list = data.results;
        
        if (!Array.isArray(list) || list.length === 0) {
            console.error('No trending items found');
            return [];
        }
        
        // Select candidates (first 10 items)
        const candidates = list.slice(0, 10);
        
        // Fetch trailer keys in parallel
        const results = await Promise.all(
            candidates.map(item => fetchItemTrailerKey(item, apiPaths))
        );
        
        // Filter items with valid trailers
        const withTrailer = results.filter(r => !!r.trailerKey);
        
        if (withTrailer.length) {
            const chosen = withTrailer[Math.floor(Math.random() * withTrailer.length)];
            buildBannerSection(chosen.item, chosen.trailerKey, chosen.mediaType);
        } else {
            console.warn('No trailers found in trending items; hero will not show video');
            const randomIndex = parseInt(Math.random() * candidates.length);
            const bannerItem = candidates[randomIndex];
            buildBannerSection(bannerItem, null, bannerItem.media_type || 'movie');
        }
        
        return list;
    } catch (err) {
        console.error('Error fetching trending:', err);
        return [];
    }
}

/**
 * Build the hero banner section with movie/TV show
 */
function buildBannerSection(movie, trailerKey, mediaType) {
    const bannerCont = document.getElementById('banner-section');
    const bannerContentWrapper = document.getElementById('banner-content-wrapper');
    const heroVideo = document.getElementById('hero-video');
    
    if (!movie) {
        console.error('Movie object is null/undefined');
        return;
    }
    
    console.log('Building banner with movie:', movie);
    
    const title = movie.title || movie.name || 'Unknown Title';
    const releaseDate = movie.release_date || movie.first_air_date || 'N/A';
    const overview = movie.overview || 'No overview available';
    const backdropPath = movie.backdrop_path || '';
    const movieId = movie.id;
    
    // Set banner background image as fallback
    if (backdropPath) {
        bannerCont.style.backgroundImage = `url('${IMG_PATH}${backdropPath}')`;
    }
    
    // Only show video if we have a valid trailer key
    if (trailerKey) {
        const youtubeUrl = `https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1&mute=1&enablejsapi=1`;
        heroVideo.src = youtubeUrl;
        heroVideo.style.display = 'block';
        console.log('Hero video autoplaying (muted):', youtubeUrl);
        
        // Initialize player after a short delay to allow iframe to load
        setTimeout(() => initHeroPlayer(), 1000);
        
        // Add unmute control
        const muteNotice = document.createElement('div');
        muteNotice.id = 'hero-mute-notice';
        muteNotice.innerHTML = `🔇`;
        muteNotice.addEventListener('click', () => {
            const tryUnmute = (retries = 0) => {
                try {
                    if (heroPlayer && heroPlayer.unMute && typeof heroPlayer.unMute === 'function') {
                        heroPlayer.unMute();
                        if (heroPlayer.playVideo) heroPlayer.playVideo();
                        muteNotice.style.display = 'none';
                        console.log('Video unmuted via YouTube API');
                        return true;
                    }
                } catch (e) {
                    console.warn('YT API unmute attempt failed:', e);
                }
                
                // If player not ready and we haven't retried too many times, try initializing and retry
                if (retries < 3) {
                    console.log(`Unmute retry ${retries + 1}/3`);
                    if (!heroPlayer) initHeroPlayer();
                    setTimeout(() => tryUnmute(retries + 1), 500);
                    return false;
                }
                
                // Last resort: Show a message instead of reloading
                console.error('Could not unmute via API after retries');
                alert('Please refresh the page to enable sound on the hero video');
                muteNotice.style.display = 'none';
                return false;
            };
            
            tryUnmute();
        });
        bannerCont.appendChild(muteNotice);
    } else {
        heroVideo.style.display = 'none';
        console.log('No valid trailer found - using background image only');
    }
    
    const div = document.createElement('div');
    div.innerHTML = `
        <h2 class="banner__title">${title}</h2>
        <p class="banner__info">Trending in movies | Released - ${releaseDate}</p>
        <p class="banner__overview">${overview && overview.length > 200 ? overview.slice(0,200).trim()+ '...':overview}</p>
        <div class="action-buttons-cont">
            <button class="action-button banner-play-btn" data-movie-id="${movieId}" data-media-type="${mediaType || (movie.media_type || 'movie')}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="Hawkins-Icon Hawkins-Icon-Standard"><path d="M4 2.69127C4 1.93067 4.81547 1.44851 5.48192 1.81506L22.4069 11.1238C23.0977 11.5037 23.0977 12.4963 22.4069 12.8762L5.48192 22.1849C4.81546 22.5515 4 22.0693 4 21.3087V2.69127Z" fill="currentColor"></path></svg> &nbsp;&nbsp; Play</button>
            <button class="action-button banner-info-btn" data-movie-id="${movieId}" data-media-type="${mediaType || (movie.media_type || 'movie')}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="Hawkins-Icon Hawkins-Icon-Standard"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3ZM1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM13 10V18H11V10H13ZM12 8.5C12.8284 8.5 13.5 7.82843 13.5 7C13.5 6.17157 12.8284 5.5 12 5.5C11.1716 5.5 10.5 6.17157 10.5 7C10.5 7.82843 11.1716 8.5 12 8.5Z" fill="currentColor"></path></svg> &nbsp;&nbsp; More Info</button>
        </div>
    `;
    div.className = "banner-content container";
    bannerContentWrapper.append(div);
}

// Expose onYouTubeIframeAPIReady to global scope for YouTube API callback
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
