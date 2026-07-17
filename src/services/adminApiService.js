/* ============================================
   CineVault — Admin API Service
   HTTP client for the local admin Express server
   ============================================ */

import { ADMIN_API_URL } from '@/utils/constants';

const API_BASE = ADMIN_API_URL;

async function adminFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `Admin API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Could not connect to the Admin Server on port 3001. Please make sure "npm start" is running in your terminal.');
    }
    throw error;
  }
}

// ---- Movies ----
export async function getMovies() {
  return adminFetch('/api/movies');
}

export async function addMovie(movie) {
  return adminFetch('/api/movies', {
    method: 'POST',
    body: JSON.stringify(movie),
  });
}

export async function updateMovie(id, movie) {
  return adminFetch(`/api/movies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(movie),
  });
}

export async function deleteMovie(id) {
  return adminFetch(`/api/movies/${id}`, {
    method: 'DELETE',
  });
}

// ---- Collections ----
export async function getCollections() {
  return adminFetch('/api/collections');
}

export async function updateCollections(collections) {
  return adminFetch('/api/collections', {
    method: 'POST',
    body: JSON.stringify(collections),
  });
}

// ---- Settings ----
export async function getSettings() {
  return adminFetch('/api/settings');
}

export async function updateSettings(settings) {
  return adminFetch('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

// ---- Import/Export ----
export async function exportCatalog() {
  return adminFetch('/api/export');
}

export async function importCatalog(catalogData) {
  return adminFetch('/api/import', {
    method: 'POST',
    body: JSON.stringify(catalogData),
  });
}
