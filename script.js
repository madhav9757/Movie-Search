⎝⎝// ============================================
// CONFIGURATION & CONSTANTS
// ============================================
const CONFIG = {
    API_KEY: '33f76330',
    API_BASE_URL: 'https://www.omdbapi.com/',
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 3000,
    SCROLL_THRESHOLD: 300
};

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    form: document.getElementById('searchForm'),
    input: document.getElementById('searchInput'),
    grid: document.getElementById('resultsGrid'),
    modal: document.getElementById('movieDetailModal'),
    closeModal: document.getElementById('closeModal'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    emptyState: document.getElementById('emptyState'),
    resultsCount: document.getElementById('resultsCount'),
    themeToggle: document.getElementById('themeToggle'),
    scrollToTop: document.getElementById('scrollToTop'),
    toastContainer: document.getElementById('toastContainer'),
    shareButton: document.getElementById('shareButton'),
    imdbLink: document.getElementById('imdbLink')
};

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    detailCache: {},
    currentSearch: '',
    isLoading: false,
    currentMovie: null
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function to limit API calls
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Show loading indicator
 */
function showLoading() {
    state.isLoading = true;
    elements.loadingIndicator?.classList.remove('hidden');
    elements.grid.innerHTML = '';
    elements.emptyState?.classList.add('hidden');
    elements.resultsCount.textContent = '';
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    state.isLoading = false;
    elements.loadingIndicator?.classList.add('hidden');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    
    elements.toastContainer?.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
}

/**
 * Create movie card element
 */
function createMovieCard(movie) {
    const div = document.createElement('div');
    div.className = 'movie';
    div.setAttribute('role', 'listitem');
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', `${movie.Title} (${movie.Year})`);
    
    const posterUrl = movie.Poster !== "N/A" 
        ? movie.Poster 
        : 'https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Image';
    
    div.innerHTML = `
        <img src="${posterUrl}" 
             alt="${movie.Title} poster" 
             loading="lazy"
             onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Image'">
        <h3>${movie.Title}</h3>
        <p>${movie.Year} • ${movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1)}</p>
    `;
    
    // Click handler
    const handleClick = () => {
        if (state.detailCache[movie.imdbID]) {
            showMovieDetails(state.detailCache[movie.imdbID]);
        } else {
            fetchMovieDetails(movie.imdbID, true);
        }
    };
    
    div.addEventListener('click', handleClick);
    div.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    });
    
    return div;
}

/**
 * Format genres as tags
 */
function formatGenres(genreString) {
    if (!genreString || genreString === "N/A") return '';
    
    const genres = genreString.split(',').map(g => g.trim());
    return genres.map(genre => 
        `<span class="genre-tag">${genre}</span>`
    ).join('');
}

/**
 * Get rating color based on value
 */
function getRatingColor(rating) {
    const numRating = parseFloat(rating);
    if (isNaN(numRating)) return 'var(--text-secondary)';
    if (numRating >= 8) return '#1db954';
    if (numRating >= 6) return '#ffd700';
    return '#ff6b6b';
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Search for movies
 */
async function searchMovies(searchTerm) {
    if (!searchTerm || state.isLoading) return;
    
    showLoading();
    state.currentSearch = searchTerm;
    
    try {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}?s=${encodeURIComponent(searchTerm)}&apikey=${CONFIG.API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        hideLoading();
        
        // Clear previous cache
        state.detailCache = {};
        
        if (data.Response === "True") {
            displayResults(data.Search, searchTerm);
            // Preload details for all results
            data.Search.forEach(movie => fetchMovieDetails(movie.imdbID));
        } else {
            displayNoResults(searchTerm);
        }
    } catch (error) {
        hideLoading();
        console.error('Search error:', error);
        showToast('Failed to search movies. Please try again.', 'error');
        displayNoResults(searchTerm);
    }
}

/**
 * Fetch detailed movie information
 */
async function fetchMovieDetails(imdbID, showModal = false) {
    // Return cached data if available
    if (state.detailCache[imdbID]) {
        if (showModal) {
            showMovieDetails(state.detailCache[imdbID]);
        }
        return state.detailCache[imdbID];
    }
    
    try {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}?i=${imdbID}&apikey=${CONFIG.API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const movie = await response.json();
        
        if (movie.Response === "True") {
            state.detailCache[imdbID] = movie;
            if (showModal) {
                showMovieDetails(movie);
            }
            return movie;
        }
    } catch (error) {
        console.error(`Failed to fetch details for ${imdbID}:`, error);
        if (showModal) {
            showToast('Failed to load movie details', 'error');
        }
    }
    
    return null;
}

// ============================================
// UI DISPLAY FUNCTIONS
// ============================================

/**
 * Display search results
 */
function displayResults(movies, searchTerm) {
    elements.grid.innerHTML = '';
    elements.emptyState?.classList.add('hidden');
    
    // Update results count
    elements.resultsCount.textContent = `Found ${movies.length} result${movies.length !== 1 ? 's' : ''} for "${searchTerm}"`;
    
    // Create and append movie cards with staggered animation
    movies.forEach((movie, index) => {
        const card = createMovieCard(movie);
        card.style.animationDelay = `${index * 0.05}s`;
        elements.grid.appendChild(card);
    });
}

/**
 * Display no results message
 */
function displayNoResults(searchTerm) {
    elements.grid.innerHTML = '';
    elements.resultsCount.textContent = '';
    elements.emptyState?.classList.remove('hidden');
    
    const emptyTitle = elements.emptyState?.querySelector('.empty-title');
    const emptyText = elements.emptyState?.querySelector('.empty-text');
    
    if (emptyTitle) {
        emptyTitle.textContent = 'No movies found';
    }
    if (emptyText) {
        emptyText.textContent = `No results for "${searchTerm}". Try a different search term.`;
    }
}

/**
 * Show movie details in modal
 */
function showMovieDetails(movie) {
    if (!movie) return;
    
    state.currentMovie = movie;
    
    // Update poster
    const posterUrl = movie.Poster !== "N/A" 
        ? movie.Poster 
        : 'https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Image';
    
    document.getElementById('modalPoster').src = posterUrl;
    document.getElementById('modalPoster').alt = `${movie.Title} poster`;
    
    // Update title and basic info
    document.getElementById('modalTitle').textContent = movie.Title;
    document.getElementById('modalYear').textContent = movie.Year || 'N/A';
    document.getElementById('modalRated').textContent = movie.Rated || 'N/A';
    document.getElementById('modalRuntime').textContent = movie.Runtime || 'N/A';
    
    // Update genres
    const genreContainer = document.getElementById('modalGenre');
    genreContainer.innerHTML = formatGenres(movie.Genre);
    
    // Update plot
    document.getElementById('modalPlot').textContent = movie.Plot || 'No plot available.';
    
    // Update details
    document.getElementById('modalDirector').textContent = movie.Director || 'N/A';
    document.getElementById('modalActors').textContent = movie.Actors || 'N/A';
    document.getElementById('modalWriter').textContent = movie.Writer || 'N/A';
    
    // Update ratings
    const imdbRating = movie.imdbRating || 'N/A';
    const ratingElement = document.getElementById('modalRating');
    ratingElement.textContent = imdbRating;
    ratingElement.style.color = getRatingColor(imdbRating);
    
    // Update other ratings
    if (movie.Ratings && Array.isArray(movie.Ratings)) {
        const rtRating = movie.Ratings.find(r => r.Source === "Rotten Tomatoes");
        const mcRating = movie.Ratings.find(r => r.Source === "Metacritic");
        
        const rtElement = document.getElementById('modalRT');
        const mcElement = document.getElementById('modalMetacritic');
        
        if (rtRating) {
            rtElement.textContent = rtRating.Value;
            document.getElementById('rtRating').style.display = 'block';
        } else {
            document.getElementById('rtRating').style.display = 'none';
        }
        
        if (mcRating) {
            mcElement.textContent = mcRating.Value;
            document.getElementById('mcRating').style.display = 'block';
        } else {
            document.getElementById('mcRating').style.display = 'none';
        }
    }
    
    // Update IMDb link
    if (movie.imdbID) {
        elements.imdbLink.href = `https://www.imdb.com/title/${movie.imdbID}/`;
    }
    
    // Show modal
    elements.modal?.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Focus close button for accessibility
    elements.closeModal?.focus();
}

/**
 * Hide movie details modal
 */
function hideMovieDetails() {
    elements.modal?.classList.add('hidden');
    document.body.classList.remove('modal-open');
    state.currentMovie = null;
}

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Handle form submission
 */
elements.form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchTerm = elements.input?.value.trim();
    
    if (!searchTerm) {
        showToast('Please enter a movie title', 'warning');
        return;
    }
    
    await searchMovies(searchTerm);
});

/**
 * Handle modal close
 */
elements.closeModal?.addEventListener('click', hideMovieDetails);

// Close modal on overlay click
elements.modal?.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
        hideMovieDetails();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !elements.modal?.classList.contains('hidden')) {
        hideMovieDetails();
    }
});

/**
 * Handle share button
 */
elements.shareButton?.addEventListener('click', async () => {
    if (!state.currentMovie) return;
    
    const shareData = {
        title: state.currentMovie.Title,
        text: `Check out ${state.currentMovie.Title} (${state.currentMovie.Year})`,
        url: window.location.href
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
            showToast('Shared successfully!', 'success');
        } else {
            // Fallback: copy to clipboard
            const text = `${shareData.title} - ${shareData.text}`;
            await navigator.clipboard.writeText(text);
            showToast('Link copied to clipboard!', 'success');
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Share error:', error);
            showToast('Failed to share', 'error');
        }
    }
});

/**
 * Handle theme toggle
 */
elements.themeToggle?.addEventListener('click', () => {
    // Theme toggle functionality can be implemented here
    showToast('Theme toggle coming soon!', 'info');
});

/**
 * Handle scroll to top button
 */
elements.scrollToTop?.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Show/hide scroll to top button
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(() => {
        if (window.scrollY > CONFIG.SCROLL_THRESHOLD) {
            elements.scrollToTop?.classList.remove('hidden');
        } else {
            elements.scrollToTop?.classList.add('hidden');
        }
    }, 100);
});

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the application
 */
function init() {
    console.log('🎬 Movie Search Platform initialized');
    
    // Focus on search input
    elements.input?.focus();
    
    // Add input validation
    elements.input?.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        if (value.length > 100) {
            showToast('Search term is too long', 'warning');
        }
    });
    
    // Add loading state to form
    elements.form?.addEventListener('submit', () => {
        elements.input?.blur(); // Remove focus from input
    });
    
    // Check for URL parameters (for deep linking)
    const urlParams = new URLSearchParams(window.location.search);
    const imdbId = urlParams.get('id');
    const searchQuery = urlParams.get('q');
    
    if (imdbId) {
        fetchMovieDetails(imdbId, true);
    } else if (searchQuery) {
        elements.input.value = searchQuery;
        searchMovies(searchQuery);
    }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================
// ERROR HANDLING
// ============================================

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// ============================================
// PERFORMANCE MONITORING (Optional)
// ============================================

// Log performance metrics
window.addEventListener('load', () => {
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⚡ Page loaded in ${pageLoadTime}ms`);
    }
});
