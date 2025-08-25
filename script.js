const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const grid = document.getElementById('resultsGrid');
const modal = document.getElementById('movieDetailModal');
const closeModal = document.getElementById('closeModal');

// Store fetched movie details by IMDb ID
const detailCache = {};

closeModal.addEventListener('click', () => {
  modal.classList.add('hidden');
  document.body.classList.remove('modal-open');
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const searchTerm = input.value.trim();
  if (!searchTerm) return;

  const response = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=33f76330`);
  const data = await response.json();

  grid.innerHTML = '';
  Object.keys(detailCache).forEach(key => delete detailCache[key]); // clear cache

  if (data.Response === "True") {
    data.Search.forEach(movie => {
      const div = document.createElement('div');
      div.className = 'movie';
      div.innerHTML = `
        <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}" alt="${movie.Title}">
        <h3>${movie.Title}</h3>
        <p>${movie.Year} • ${movie.Type}</p>
      `;

      div.addEventListener('click', () => {
        if (detailCache[movie.imdbID]) {
          showMovieDetails(detailCache[movie.imdbID]);
        } else {
          // If not preloaded yet, fetch immediately
          fetchMovieDetails(movie.imdbID);
        }
      });

      grid.appendChild(div);

      // Start preloading full details in background
      fetchMovieDetails(movie.imdbID);
    });
  } else {
    grid.innerHTML = `<p>No results found for "${searchTerm}".</p>`;
  }
});

async function fetchMovieDetails(imdbID) {
  if (detailCache[imdbID]) return;
  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=33f76330`);
    const movie = await res.json();
    detailCache[imdbID] = movie;
  } catch (err) {
    console.error("Failed to fetch details for", imdbID);
  }
}

function showMovieDetails(movie) {
  document.getElementById('modalPoster').src =
    movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image';
  document.getElementById('modalTitle').textContent = movie.Title;
  document.getElementById('modalYear').textContent = `${movie.Year} • ${movie.Genre} • ${movie.Runtime}`;
  document.getElementById('modalPlot').textContent = movie.Plot;
  document.getElementById('modalDirector').textContent = movie.Director;
  document.getElementById('modalActors').textContent = movie.Actors;
  document.getElementById('modalRating').textContent = movie.imdbRating;

  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}
