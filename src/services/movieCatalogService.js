/* ============================================
   CineVault — Movie Catalog Service
   Reads and filters the local movies.json catalog
   ============================================ */

let catalogCache = null;
let catalogTimestamp = 0;
const CATALOG_CACHE_TTL = 60000; // 1 minute for dev, effectively permanent in production

/**
 * Load the movie catalog from data/movies.json
 */
export async function loadCatalog() {
  const now = Date.now();
  if (catalogCache && now - catalogTimestamp < CATALOG_CACHE_TTL) {
    return catalogCache;
  }

  try {
    const response = await fetch('/data/movies.json');
    if (!response.ok) throw new Error('Failed to load movie catalog');
    const data = await response.json();
    catalogCache = data;
    catalogTimestamp = now;
    return data;
  } catch (error) {
    console.error('Error loading movie catalog:', error);
    // Return empty catalog on error
    return { movies: [], lastUpdated: null };
  }
}

/**
 * Get all movies from the catalog
 */
export async function getAllMovies() {
  const catalog = await loadCatalog();
  return catalog.movies || [];
}

/**
 * Get a single movie by its local ID
 */
export async function getMovieById(id) {
  const movies = await getAllMovies();
  return movies.find(m => m.id === id) || null;
}

/**
 * Get a single movie by its TMDB ID
 */
export async function getMovieByTmdbId(tmdbId) {
  const movies = await getAllMovies();
  return movies.find(m => m.tmdbId === tmdbId) || null;
}

/**
 * Get all featured movies
 */
export async function getFeaturedMovies() {
  const movies = await getAllMovies();
  return movies
    .filter(m => m.featured)
    .sort((a, b) => (a.customOrder || 999) - (b.customOrder || 999));
}

/**
 * Check if a TMDB ID exists in our library
 */
export async function isMovieInLibrary(tmdbId) {
  const movies = await getAllMovies();
  return movies.some(m => m.tmdbId === tmdbId);
}

/**
 * Filter an array of TMDB IDs to only those in our library
 * Returns the matching catalog entries
 */
export async function filterLibraryMovies(tmdbIds) {
  const movies = await getAllMovies();
  const tmdbIdSet = new Set(tmdbIds);
  return movies.filter(m => tmdbIdSet.has(m.tmdbId));
}

/**
 * Get movies from our library that match TMDB results
 * Useful for filtering recommendations/similar movies
 */
export async function getLibraryMatchingTMDB(tmdbMovies) {
  const movies = await getAllMovies();
  const libraryTmdbIds = new Set(movies.map(m => m.tmdbId));
  
  return tmdbMovies
    .filter(tm => libraryTmdbIds.has(tm.id))
    .map(tm => {
      const catalogEntry = movies.find(m => m.tmdbId === tm.id);
      return { ...tm, catalogEntry };
    });
}

/**
 * Get movies by collection (custom collection ID from collections.json)
 */
export async function getMoviesByCollection(collectionId) {
  const movies = await getAllMovies();
  return movies.filter(m => m.collections?.includes(collectionId));
}

/**
 * Get recently added movies (sorted by dateAdded or fallback to array order)
 */
export async function getRecentlyAdded(limit = 20) {
  const movies = await getAllMovies();
  return [...movies]
    .sort((a, b) => {
      const dateA = new Date(a.dateAdded || 0).getTime();
      const dateB = new Date(b.dateAdded || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, limit);
}

/**
 * Search local catalog
 */
export async function searchCatalog(query) {
  if (!query?.trim()) return [];
  const movies = await getAllMovies();
  const q = query.toLowerCase().trim();
  
  return movies.filter(m => {
    // Search by title (stored title or ID-derived)
    if (m.title?.toLowerCase().includes(q)) return true;
    if (m.id?.toLowerCase().includes(q)) return true;
    // Search by TMDB ID
    if (m.tmdbId?.toString() === q) return true;
    return false;
  });
}

/**
 * Invalidate the catalog cache (call after admin updates)
 */
export function invalidateCatalogCache() {
  catalogCache = null;
  catalogTimestamp = 0;
}

/**
 * Load collections from data/collections.json
 */
export async function loadCollections() {
  try {
    const response = await fetch('/data/collections.json');
    if (!response.ok) throw new Error('Failed to load collections');
    return await response.json();
  } catch (error) {
    console.error('Error loading collections:', error);
    return { collections: [], lastUpdated: null };
  }
}

/**
 * Load settings from data/settings.json
 */
export async function loadSettings() {
  try {
    const response = await fetch('/data/settings.json');
    if (!response.ok) throw new Error('Failed to load settings');
    return await response.json();
  } catch (error) {
    console.error('Error loading settings:', error);
    return { siteName: 'CineVault', heroMode: 'carousel', featuredMovieIds: [] };
  }
}
