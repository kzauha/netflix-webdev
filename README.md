# Netflix Clone - Web Development Project

A fully functional Netflix-style streaming platform clone built with vanilla JavaScript, HTML5, and CSS3. Features include dynamic content loading from TMDb API, auto-playing hero trailers, interactive modals, and a fully responsive design.

## 🎬 Live Demo

**Note:** This project requires an HTTP server to run properly (ES6 modules and CORS). Use Live Server, `npx serve`, or deploy to GitHub Pages.

## 📁 Project Structure

```
netflix/
├── index.html              # Main HTML file with semantic markup
├── images/                 # Local assets
│   ├── netflix_favicon.jpg
│   ├── netflix_header.jpg
│   └── avatar.png
├── js/                     # JavaScript ES6 modules
│   ├── config.js          # TMDb API configuration and endpoints
│   ├── utils.js           # Utility functions (trailer selection, caching)
│   ├── hero.js            # Hero/banner section with YouTube player
│   ├── modal.js           # Modal system (Play/More Info/Card details)
│   ├── cards.js           # Movie cards, sections, and circular slider
│   └── main.js            # Application entry point and initialization
├── css/                    # Modular CSS architecture
│   ├── variables.css      # CSS custom properties (colors, spacing)
│   ├── global.css         # Global styles and resets
│   ├── header.css         # Navigation bar styles
│   ├── hero.css           # Hero/banner section with video overlay
│   ├── cards.css          # Movie cards, hover effects, slider controls
│   ├── modal.css          # Modal overlay, video player, metadata
│   ├── footer.css         # Footer layout and social links
│   └── responsive.css     # Mobile-first responsive breakpoints
└── README.md              # Project documentation
```

## ✨ Features

### Core Functionality
- **Dynamic Content Loading**: Fetches trending movies/TV shows and genre-based categories from TMDb API
- **Auto-Playing Hero Video**: Muted autoplay trailer in the hero section with an unmute button overlay
- **Smart Trailer Selection**: Filters out YouTube Shorts and non-English dubs, prioritizes official trailers over teasers/clips
- **Trailer Availability Filtering**: Only displays cards for titles that have available YouTube trailers
- **In-Memory Caching**: Caches trailer availability to reduce redundant API calls and improve performance

### Interactive Modal System
- **Play Modal**: Opens with auto-playing YouTube trailer in fullback message if unavailable
- **More Info Modal**: Displays movie/TV metadata (rating, genres, year, overview, cast)
- **Card Click Modal**: Shows both trailer and details in a unified view
- **Keyboard & Click Navigation**: Close with X button, overlay click, or ESC key

### Movie Browsing
- **Category Sections**: Organized by TMDb genres (Action, Comedy, Drama, Documentary, etc.)
- **Circular Slider**: Infinite scroll navigation with next/prev buttons and mouse wheel support
- **Title Overlay on Hover**: Shows movie/TV title when hovering over cards
- **Popularity Sorting**: Requests sorted by popularity with video availability hint

### Design & UX
- **Fully Responsive**: Optimized layouts for desktop (1024px+), tablet (768px), mobile (480px), and small phones (360px)
- **Netflix-Inspired UI**: Dark theme, hover animations, smooth transitions
- **Custom SVG Icons**: Inline search, notification bell, and social media icons (Facebook, Twitter, Instagram, YouTube)
- **Fade Gradient Overlay**: Hero section fades into content for seamless transitions
- **Accessible Controls**: ARIA labels, semantic HTML, keyboard navigation support

### Technical Architecture
- **ES6 Modules**: Clean separation of concerns with import/export
- **Modular CSS**: Component-based styles with CSS custom properties
- **YouTube IFrame API**: Integrated player with mute/unmute control
- **Async/Await**: Modern JavaScript for API calls and concurrent operations
- **Error Handling**: Graceful fallbacks for missing data or failed API calls

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local HTTP server (required for ES6 modules)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd netflix
   ```

2. **Get TMDb API Key**
   - Sign up at [https://www.themoviedb.org/](https://www.themoviedb.org/)
   - Generate an API key from your account settings
   - Replace the key in `js/config.js`:
     ```javascript
     export const API_KEY = "your_tmdb_api_key_here";
     ```

3. **Serve the project**
   
   **Option A - VS Code Live Server:**
   - Install Live Server extension
   - Right-click `index.html` → "Open with Live Server"
   
   **Option B - Node.js:**
   ```bash
   npx serve .
   # Opens at http://localhost:3000
   ```
   
   **Option C - Python:**
   ```bash
   python -m http.server 8000
   # Opens at http://localhost:8000
   ```

4. **Access the app**
   - Navigate to `http://localhost:<port>` in your browser
   - The app will automatically fetch trending content and categories

### Deployment (GitHub Pages)

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select branch (main) and root folder
4. Access at `https://yourusername.github.io/repository-name`

**Note:** Your TMDb API key will be visible in the deployed code. For production, consider using a backend proxy.

## 🔧 Module Overview

### JavaScript Modules

| Module | Purpose |
|--------|---------|
| **config.js** | TMDb API configuration, endpoints for movies/TV/videos/credits |
| **utils.js** | Trailer selection logic, caching system, utility functions |
| **hero.js** | Hero video autoplay, YouTube IFrame API, unmute control |
| **modal.js** | Modal state management, Play/Info/Card modals, video/details rendering |
| **cards.js** | Category sections, movie cards, circular slider navigation |
| **main.js** | App initialization, event listener setup, header scroll effect |

### CSS Modules

| Module | Purpose |
|--------|---------|
| **variables.css** | CSS custom properties (colors, spacing, transitions) |
| **global.css** | Base styles, container, scrollbar hiding, resets |
| **header.css** | Navigation bar, logo, menu items, icon spacing |
| **hero.css** | Banner section, video overlay, action buttons, mute control |
| **cards.css** | Movie thumbnails, hover effects, slider controls, title overlay |
| **modal.css** | Modal overlay, video player, metadata pills, cast list |
| **footer.css** | Footer layout, social icons, link styling |
| **responsive.css** | Breakpoints (360px, 480px, 768px, 1024px) for mobile/tablet/desktop |

## 🎨 Customization

### API Configuration
Edit `js/config.js` to modify endpoints or add language filters:
```javascript
export const API_KEY = "your_api_key";
export const apiPaths = {
    fetchTrending: `${API_ENDPOINT}/trending/all/day?api_key=${API_KEY}`,
    fetchMovieVideos: (id) => `${API_ENDPOINT}/movie/${id}/videos?api_key=${API_KEY}`,
    // Add custom endpoints here
};
```

### Color Scheme
Edit `css/variables.css` to change the theme:
```css
:root {
    --bg-primary: #141414;        /* Main background */
    --text-primary: #e5e5e5;      /* Primary text */
    --accent-color: #e50914;      /* Netflix red accent */
    --hover-scale: 1.1;           /* Card hover scale */
}
```

### Trailer Selection Logic
Modify `js/utils.js` to adjust filtering:
```javascript
export function selectBestTrailer(videos) {
    // Customize filtering: remove/add criteria
    // Priority: Official Trailer > Trailer > Teaser > Clip
}
```

### Responsive Breakpoints
Adjust `css/responsive.css` for different device sizes:
```css
@media (max-width: 768px) {
    /* Tablet styles */
}
@media (max-width: 480px) {
    /* Mobile styles */
}
```

## 📝 API Reference

### TMDb API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `/trending/all/day` | Fetch trending movies/TV for hero banner |
| `/genre/movie/list` | Get all movie genres for category sections |
| `/discover/movie` | Find movies by genre with popularity sorting |
| `/movie/{id}/videos` | Get YouTube trailer keys for movies |
| `/tv/{id}/videos` | Get YouTube trailer keys for TV shows |
| `/movie/{id}` | Fetch detailed movie metadata |
| `/tv/{id}` | Fetch detailed TV show metadata |
| `/movie/{id}/credits` | Get cast information for movies |
| `/tv/{id}/credits` | Get cast information for TV shows |

**Rate Limits:** TMDb free tier allows thousands of requests per day. Current caching system reduces redundant calls.

### YouTube IFrame API

Used for embedded video playback with controls:
- Auto-play with mute (browser-allowed)
- Programmatic mute/unmute control
- Player state management
- Error handling for unavailable videos

## 🌐 Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |

**Requirements:**
- ES6 module support (`<script type="module">`)
- Fetch API
- Async/await
- CSS Grid and Flexbox
- CSS custom properties

**Known Limitations:**
- Cannot open via `file://` protocol (use HTTP server)
- Autoplay requires muted video (browser policy)
- TMDb API key visible in client-side code

## 🛠️ Technical Stack

- **HTML5**: Semantic markup, accessibility features
- **CSS3**: Custom properties, Grid, Flexbox, media queries
- **Vanilla JavaScript (ES6+)**: Modules, async/await, Fetch API
- **External APIs**: TMDb v3, YouTube IFrame API
- **Architecture**: Modular component-based structure

## 📊 Performance Features

- **In-Memory Caching**: Reduces API calls by storing trailer availability
- **Lazy Loading**: Categories load progressively
- **Batch Processing**: Parallel API calls for trailer checking (30 items per batch)
- **Optimized Images**: TMDb serves optimized poster/backdrop images
- **CSS Animations**: GPU-accelerated transforms for smooth hover effects

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ Modular JavaScript architecture with ES6 imports/exports
- ✅ RESTful API integration with error handling
- ✅ Async/await patterns for concurrent operations
- ✅ CSS custom properties for themeable design
- ✅ Responsive design with mobile-first approach
- ✅ YouTube IFrame API integration
- ✅ DOM manipulation and event handling
- ✅ Caching strategies for performance optimization
- ✅ Component-based CSS architecture
- ✅ Accessibility best practices (ARIA labels, semantic HTML)

## 📄 License

This is an educational project created for web development learning purposes. Not affiliated with or endorsed by Netflix.

## 🙏 Credits & Acknowledgments

- **TMDb API** - Movie and TV show data
- **YouTube IFrame API** - Video playback functionality
- **Netflix** - Design inspiration and UI patterns
- **Kabish Pokhrel** - Developer

## 🐛 Known Issues & Future Enhancements

### Current Limitations
- API key exposed in client-side code
- No user authentication or personalization
- Limited to TMDb's available trailers
- No video quality selection

### Potential Improvements
- Add search functionality
- Implement user watchlist/favorites (localStorage)
- Add TV show seasons/episodes navigation
- Integrate with multiple video providers
- Add loading skeletons for better UX
- Implement virtual scrolling for large lists
- Add keyboard shortcuts for navigation
- Create a backend proxy to secure API keys

## 📞 Contact

For questions or feedback about this project:
- **GitHub**: [Your GitHub Profile]
- **Email**: [Your Email]

---

**⭐ Star this repository if you found it helpful!**
