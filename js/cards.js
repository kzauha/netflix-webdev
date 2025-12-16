// ==========================================
// NETFLIX-STYLE MOVIE CARDS (TMDB VERSION)
// ==========================================

import { IMG_PATH, apiPaths } from "./config.js";
import { selectBestTrailer, getCachedTrailer, cacheTrailer } from "./utils.js";

const VISIBLE_COUNT = 6;
const sectionState = new Map();

/* ----------------------------
   Utilities
----------------------------- */
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/* ----------------------------
   Public Init
----------------------------- */
export async function fetchAndBuildAllSections() {
  const res = await fetch(apiPaths.fetchAllCategories);
  const data = await res.json();
  const categories = data.genres || [];

  for (const category of categories) {
    await fetchAndBuildMovieSection(
      apiPaths.fetchMoviesList(category.id),
      category.name
    );
  }
}

/* ----------------------------
   Fetch & Filter
----------------------------- */
async function fetchAndBuildMovieSection(url, title) {
  const res = await fetch(url);
  const data = await res.json();

  const movies = (data.results || []).filter(m => m?.backdrop_path);
  if (!movies.length) return;

  const checked = (await Promise.all(movies.slice(0, 30).map(ensureHasTrailer)))
    .filter(Boolean)
    .slice(0, 12);

  buildSection(checked, title);
}

async function ensureHasTrailer(item) {
  const type = item.media_type === "tv" ? "tv" : "movie";
  const cached = getCachedTrailer(item.id, type);

  if (cached !== undefined) return cached ? item : null;

  const url =
    type === "tv"
      ? apiPaths.fetchTvVideos(item.id)
      : apiPaths.fetchMovieVideos(item.id);

  const res = await fetch(url);
  const data = await res.json();
  const trailer = selectBestTrailer(data.results);

  cacheTrailer(item.id, type, trailer ? trailer.key : null);
  return trailer ? item : null;
}

/* ----------------------------
   Section Builder
----------------------------- */
function buildSection(list, category) {
  const container = document.getElementById("movies-cont");
  const id = `sec-${slugify(category)}`;

  sectionState.set(id, { items: [...list], offset: 0 });

  const section = document.createElement("div");
  section.className = "movies-section";
  section.innerHTML = `
    <div class="section-header">
      <h2 class="movie-section-heading">
        ${category}
        <span class="explore-nudge">Explore All</span>
      </h2>
      <div class="slider-nav">
        <button class="slider-btn prev" data-id="${id}">&#10094;</button>
        <button class="slider-btn next" data-id="${id}">&#10095;</button>
      </div>
    </div>
    <div class="movies-row" id="${id}-row"></div>
  `;

  container.append(section);
  renderSection(id);
  attachControls(id);
}

/* ----------------------------
   Render Cards
----------------------------- */
function renderSection(id) {
  const state = sectionState.get(id);
  const row = document.getElementById(`${id}-row`);
  if (!row) return;

  row.innerHTML = state.items
    .slice(state.offset, state.offset + VISIBLE_COUNT)
    .map(item => {
      const title = item.title || item.name;
      const type = item.media_type || "movie";

      return `
        <div class="movie-item" onclick="openCardModal(${item.id}, '${type}')">
          <img
            loading="lazy"
            src="${IMG_PATH}${item.backdrop_path}"
            alt="${title}"
            class="movie-img"
          />
          <div class="movie-hover">
            <div class="hover-controls">
              <button title="Play">▶</button>
              <button title="Add">＋</button>
              <button title="Like">👍</button>
            </div>
            <div class="hover-title">${title}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

/* ----------------------------
   Slider Controls
----------------------------- */
function attachControls(id) {
  const prev = document.querySelector(`.slider-btn.prev[data-id="${id}"]`);
  const next = document.querySelector(`.slider-btn.next[data-id="${id}"]`);

  prev?.addEventListener("click", () => slide(id, -1));
  next?.addEventListener("click", () => slide(id, 1));
}

function slide(id, dir) {
  const state = sectionState.get(id);
  if (!state) return;

  state.offset += dir * VISIBLE_COUNT;

  if (state.offset < 0) state.offset = 0;
  if (state.offset > state.items.length - VISIBLE_COUNT) {
    state.offset = state.items.length - VISIBLE_COUNT;
  }

  renderSection(id);
}
