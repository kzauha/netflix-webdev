// Utility Functions

// In-memory cache for trailer availability (key: "movie-123" or "tv-456", value: trailer key or null)
const trailerCache = new Map();

/**
 * Select the best trailer from TMDb video results
 * Filters out Shorts, dubs, and prioritizes official trailers
 * @param {Array} videos - Array of video objects from TMDb
 * @returns {Object|null} Best trailer object or null
 */
export function selectBestTrailer(videos) {
    if (!Array.isArray(videos) || videos.length === 0) return null;
    
    const youtubeOnly = videos.filter(vid => vid.site === 'YouTube');
    if (!youtubeOnly.length) return null;

    // Filter out Shorts and dubs
    let candidates = youtubeOnly.filter(vid => {
        const name = (vid.name || '').toLowerCase();
        return !name.includes('short') && !name.includes('dub');
    });

    // If everything got filtered, fall back to any YouTube video
    if (!candidates.length) candidates = youtubeOnly;

    // Priority 1: Official Trailers
    let trailer = candidates.find(vid => vid.type === 'Trailer' && vid.official === true);
    if (trailer) return trailer;

    // Priority 2: Any Trailer
    trailer = candidates.find(vid => vid.type === 'Trailer');
    if (trailer) return trailer;

    // Priority 3: Teaser
    trailer = candidates.find(vid => vid.type === 'Teaser');
    if (trailer) return trailer;

    // Priority 4: Clip
    trailer = candidates.find(vid => vid.type === 'Clip');
    if (trailer) return trailer;

    // Last resort: first YouTube candidate
    return candidates[0] || null;
}

/**
 * Fetch trailer key for a trending item (movie or tv) with caching
 * @param {Object} item - TMDb trending item
 * @returns {Promise<{item:Object, mediaType:string, trailerKey:string|null}>}
 */
export async function fetchItemTrailerKey(item, apiPaths) {
    if (!item || !item.id) return { item, mediaType: 'movie', trailerKey: null };
    
    const mediaType = item.media_type === 'tv' ? 'tv' : 'movie';
    const cacheKey = `${mediaType}-${item.id}`;
    
    // Check cache first
    if (trailerCache.has(cacheKey)) {
        return { item, mediaType, trailerKey: trailerCache.get(cacheKey) };
    }
    
    const url = mediaType === 'tv' ? apiPaths.fetchTvVideos(item.id) : apiPaths.fetchMovieVideos(item.id);
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        const trailer = selectBestTrailer(data.results);
        const trailerKey = trailer ? trailer.key : null;
        
        // Store in cache
        trailerCache.set(cacheKey, trailerKey);
        
        return { item, mediaType, trailerKey };
    } catch (err) {
        console.error('Error fetching item videos:', err);
        trailerCache.set(cacheKey, null);
        return { item, mediaType, trailerKey: null };
    }
}

/**
 * Check cache for trailer availability
 * @param {number} id - Movie or TV ID
 * @param {string} mediaType - 'movie' or 'tv'
 * @returns {string|null|undefined} Trailer key, null if no trailer, undefined if not cached
 */
export function getCachedTrailer(id, mediaType) {
    const cacheKey = `${mediaType}-${id}`;
    return trailerCache.get(cacheKey);
}

/**
 * Store trailer in cache
 * @param {number} id - Movie or TV ID
 * @param {string} mediaType - 'movie' or 'tv'
 * @param {string|null} trailerKey - Trailer key or null
 */
export function cacheTrailer(id, mediaType, trailerKey) {
    const cacheKey = `${mediaType}-${id}`;
    trailerCache.set(cacheKey, trailerKey);
}
