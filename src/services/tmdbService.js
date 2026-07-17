/* ============================================
   CineVault — TMDB Service
   Handles all TMDB API communication with caching
   ============================================ */

import { TMDB_BASE_URL, TMDB_ACCESS_TOKEN } from '@/utils/constants';

// In-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(endpoint, params = {}) {
  return `${endpoint}:${JSON.stringify(params)}`;
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  // Limit cache size
  if (cache.size > 500) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Make an authenticated TMDB API request
 */
async function tmdbFetch(endpoint, params = {}) {
  const cacheKey = getCacheKey(endpoint, params);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value != null) url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.status_message || `TMDB API error: ${response.status}`
    );
  }

  const data = await response.json();
  setCache(cacheKey, data);
  return data;
}

/**
 * Search movies by query
 */
export async function searchMovies(query, page = 1) {
  if (!query?.trim()) return { results: [], total_results: 0 };
  return tmdbFetch('/search/movie', {
    query: query.trim(),
    page,
    include_adult: false,
    language: 'en-US',
  });
}

/**
 * Get full movie details with appended data
 */
export async function getMovieDetails(tmdbId) {
  if (!tmdbId) throw new Error('TMDB ID is required');
  return tmdbFetch(`/movie/${tmdbId}`, {
    language: 'en-US',
    append_to_response: 'credits,recommendations,similar,images,videos,release_dates',
    include_image_language: 'en,null',
  });
}

/**
 * Get movie credits (cast & crew)
 */
export async function getMovieCredits(tmdbId) {
  return tmdbFetch(`/movie/${tmdbId}/credits`, { language: 'en-US' });
}

/**
 * Get movie images
 */
export async function getMovieImages(tmdbId) {
  return tmdbFetch(`/movie/${tmdbId}/images`, {
    include_image_language: 'en,null',
  });
}

/**
 * Get movie videos (trailers, teasers)
 */
export async function getMovieVideos(tmdbId) {
  return tmdbFetch(`/movie/${tmdbId}/videos`, { language: 'en-US' });
}

/**
 * Get movie collection details
 */
export async function getCollection(collectionId) {
  if (!collectionId) return null;
  return tmdbFetch(`/collection/${collectionId}`, { language: 'en-US' });
}

/**
 * Get movie recommendations
 */
export async function getRecommendations(tmdbId, page = 1) {
  return tmdbFetch(`/movie/${tmdbId}/recommendations`, {
    language: 'en-US',
    page,
  });
}

/**
 * Get similar movies
 */
export async function getSimilarMovies(tmdbId, page = 1) {
  return tmdbFetch(`/movie/${tmdbId}/similar`, {
    language: 'en-US',
    page,
  });
}

/**
 * Get US certification from release_dates data
 */
export function getCertification(releaseDatesData) {
  if (!releaseDatesData?.results) return null;
  const us = releaseDatesData.results.find(r => r.iso_3166_1 === 'US');
  if (!us?.release_dates?.length) return null;
  // Find theatrical or digital release with certification
  const withCert = us.release_dates.find(rd => rd.certification);
  return withCert?.certification || null;
}

/**
 * Extract director from credits
 */
export function getDirector(credits) {
  if (!credits?.crew) return null;
  const director = credits.crew.find(c => c.job === 'Director');
  return director || null;
}

/**
 * Extract writers from credits
 */
export function getWriters(credits) {
  if (!credits?.crew) return [];
  return credits.crew.filter(
    c => c.department === 'Writing' || c.job === 'Writer' || c.job === 'Screenplay' || c.job === 'Story'
  );
}

/**
 * Get YouTube trailer URL from videos
 */
export function getTrailerUrl(videos) {
  if (!videos?.results?.length) return null;
  const trailer = videos.results.find(
    v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  if (!trailer) return null;
  return `https://www.youtube.com/watch?v=${trailer.key}`;
}

/**
 * Get top billed cast (limited)
 */
export function getTopCast(credits, limit = 20) {
  if (!credits?.cast) return [];
  return credits.cast.slice(0, limit);
}

/**
 * Clear the entire cache
 */
export function clearCache() {
  cache.clear();
}

/**
 * Clear cache for a specific movie
 */
export function clearMovieCache(tmdbId) {
  for (const [key] of cache) {
    if (key.includes(`/movie/${tmdbId}`)) {
      cache.delete(key);
    }
  }
}
