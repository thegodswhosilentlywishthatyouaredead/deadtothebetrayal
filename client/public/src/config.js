// Configuration for different environments
const CONFIG = {
    development: {
        API_BASE: 'http://localhost:8085/api'
    },
    production: {
        // For GitHub Pages, you'll need to deploy the backend separately
        // Options: Heroku, Railway, Render, Vercel, etc.
        API_BASE: 'https://your-backend-url.herokuapp.com/api'
    }
};

// Auto-detect environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const environment = isProduction ? 'production' : 'development';

// Export the appropriate config
window.API_BASE = CONFIG[environment].API_BASE;
