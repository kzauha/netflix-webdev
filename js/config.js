// API Configuration
export const API_KEY = "e950e51d5d49e85f7c2f17f01eb23ba3";
export const API_ENDPOINT = "https://api.themoviedb.org/3";
export const IMG_PATH = "https://image.tmdb.org/t/p/original";

// API Paths
export const apiPaths = {
    fetchAllCategories: `${API_ENDPOINT}/genre/movie/list?api_key=${API_KEY}`,
    fetchMoviesList: (id) => `${API_ENDPOINT}/discover/movie?api_key=${API_KEY}&with_genres=${id}&sort_by=popularity.desc&include_video=true&page=1`,
    fetchTrending: `${API_ENDPOINT}/trending/all/day?api_key=${API_KEY}`,
    // Movie endpoints
    fetchMovieVideos: (movieId) => `${API_ENDPOINT}/movie/${movieId}/videos?api_key=${API_KEY}`,
    fetchMovieDetails: (movieId) => `${API_ENDPOINT}/movie/${movieId}?api_key=${API_KEY}`,
    fetchMovieCredits: (movieId) => `${API_ENDPOINT}/movie/${movieId}/credits?api_key=${API_KEY}`,
    // TV endpoints
    fetchTvVideos: (tvId) => `${API_ENDPOINT}/tv/${tvId}/videos?api_key=${API_KEY}`,
    fetchTvDetails: (tvId) => `${API_ENDPOINT}/tv/${tvId}?api_key=${API_KEY}`,
    fetchTvCredits: (tvId) => `${API_ENDPOINT}/tv/${tvId}/credits?api_key=${API_KEY}`,
};
