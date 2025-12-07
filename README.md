# 🎬 Movie Search Platform

A sleek, modern movie search application that uses the OMDb API to search and display detailed information about movies.

![Movie Search Platform](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

- **Real-time Search**: Search for movies using the OMDb API
- **Responsive Grid Layout**: Adapts beautifully to all screen sizes
- **Detailed Movie Modal**: Click on any movie to view comprehensive details including:
  - Plot synopsis
  - Director and cast information
  - IMDb ratings
  - Runtime and genre
  - Release year
- **Smart Preloading**: Movie details are preloaded in the background for instant viewing
- **Modern Dark UI**: Clean, minimalist design with smooth animations
- **Mobile Optimized**: Fully responsive design for phones, tablets, and desktops

## 🚀 Getting Started

### Prerequisites

- A web browser (Chrome, Firefox, Safari, Edge, etc.)
- Internet connection (for API calls)

### Installation

1. Clone or download this repository
2. No build process required - it's pure HTML, CSS, and JavaScript!

### Usage

1. Open `index.html` in your web browser
2. Enter a movie title in the search bar
3. Press "Search" or hit Enter
4. Click on any movie card to view detailed information
5. Close the modal by clicking the × button

## 📁 Project Structure

```
movie-search-platform/
│
├── index.html          # Main HTML structure
├── style.css           # Styling and responsive design
├── script.js           # Application logic and API integration
└── README.md           # Project documentation
```

## 🎨 Design Features

- **Dark Theme**: Easy on the eyes with a modern dark color scheme
- **Gradient Cards**: Subtle gradients on movie cards
- **Hover Effects**: Interactive feedback with green accent colors
- **Smooth Animations**: Transitions for buttons and modal
- **Custom Scrollbar**: Styled scrollbar for better aesthetics
- **Responsive Typography**: Scales text appropriately for all devices

## 🔧 Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript**: No frameworks or libraries needed
- **OMDb API**: Movie data source

## 🌐 API Information

This project uses the [OMDb API](http://www.omdbapi.com/) (The Open Movie Database).

**API Key**: The project includes a demo API key (`33f76330`). For production use or heavy traffic, please obtain your own free API key from [OMDb API](http://www.omdbapi.com/apikey.aspx).

### API Endpoints Used

- Search movies: `https://www.omdbapi.com/?s={searchTerm}&apikey={apikey}`
- Get movie details: `https://www.omdbapi.com/?i={imdbID}&apikey={apikey}`

## 📱 Responsive Breakpoints

- **Desktop**: Full grid layout with multiple columns
- **Tablet**: Adjusted grid with fewer columns
- **Mobile (< 768px)**: Optimized modal layout
- **Small Mobile (< 480px)**: Stacked form inputs, compact grid

## 🎯 Key Features Explained

### Smart Caching
The app preloads movie details in the background when search results appear, ensuring instant display when users click on a movie.

### Modal System
- Prevents body scroll when open
- Click outside or press × to close
- Displays comprehensive movie information
- Responsive layout for mobile devices

### Error Handling
- Graceful fallback for missing movie posters
- "No results found" message for failed searches
- Console error logging for failed API calls

## 🚧 Potential Improvements

- Add pagination for search results (OMDb API supports this)
- Implement search history
- Add filters (by year, genre, type)
- Include movie trailers
- Add favorites/watchlist functionality
- Implement keyboard navigation
- Add loading indicators

## 📄 License

This project is free to use for personal and educational purposes.

## 🙏 Acknowledgments

- Movie data provided by [OMDb API](http://www.omdbapi.com/)
- Inspired by modern streaming platforms like Netflix and Spotify

## 📞 Support

For issues or questions, please open an issue in the repository or contact the developer.

---

**Built with ❤️ using pure HTML, CSS, and JavaScript**
