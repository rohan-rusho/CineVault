/* ============================================
   CineVault — Admin Server (Local Only)
   Express.js REST API for JSON catalog management
   ============================================ */

import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_DIR = join(__dirname, 'data');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ---- Root Page Redirect/Help ----
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>CineVault Admin API Server</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #0a0a0f;
            color: #f0f0f5;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
          }
          .card {
            background-color: #10101a;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            max-width: 500px;
          }
          h1 {
            color: #7c5cfc;
            margin-top: 0;
          }
          p {
            color: #a0a0b8;
            line-height: 1.6;
          }
          a {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background-color: #7c5cfc;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            transition: background-color 0.2s;
          }
          a:hover {
            background-color: #9078ff;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🎬 CineVault API Server</h1>
          <p>This is the backend API server running on port 3001.</p>
          <p>To access the actual visual Admin Dashboard, open the frontend site's admin route:</p>
          <a href="http://localhost:5173/admin">Go to Admin Dashboard</a>
        </div>
      </body>
    </html>
  `);
});

// ---- Utility Functions ----

function readJSON(filename) {
  const filepath = join(DATA_DIR, filename);
  if (!existsSync(filepath)) {
    return null;
  }
  const raw = readFileSync(filepath, 'utf-8');
  return JSON.parse(raw);
}

function writeJSON(filename, data) {
  // Write to workspace data/ directory
  const rootPath = join(__dirname, 'data', filename);
  writeFileSync(rootPath, JSON.stringify(data, null, 2), 'utf-8');

  // Write to public/data/ directory for immediate client-side hot serving
  const publicPath = join(__dirname, 'public', 'data', filename);
  writeFileSync(publicPath, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50);
}

// ---- Movies API ----

app.get('/api/movies', (req, res) => {
  try {
    const data = readJSON('movies.json') || { movies: [] };
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to read movies', error: err.message });
  }
});

app.post('/api/movies', (req, res) => {
  try {
    const catalog = readJSON('movies.json') || { movies: [] };
    const movie = req.body;

    // Generate ID if not provided
    if (!movie.id) {
      movie.id = generateId(movie.title || `movie-${movie.tmdbId}`);
    }

    // Check for duplicate
    if (catalog.movies.some(m => m.id === movie.id)) {
      return res.status(409).json({ message: `Movie with ID "${movie.id}" already exists` });
    }

    if (catalog.movies.some(m => m.tmdbId === movie.tmdbId)) {
      return res.status(409).json({ message: `Movie with TMDB ID ${movie.tmdbId} already exists` });
    }

    movie.dateAdded = new Date().toISOString();
    catalog.movies.push(movie);
    catalog.lastUpdated = new Date().toISOString();

    writeJSON('movies.json', catalog);
    res.status(201).json({ message: 'Movie added', movie });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add movie', error: err.message });
  }
});

app.put('/api/movies/:id', (req, res) => {
  try {
    const catalog = readJSON('movies.json') || { movies: [] };
    const index = catalog.movies.findIndex(m => m.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Preserve dateAdded
    const dateAdded = catalog.movies[index].dateAdded;
    catalog.movies[index] = { ...req.body, id: req.params.id, dateAdded };
    catalog.movies[index].lastModified = new Date().toISOString();
    catalog.lastUpdated = new Date().toISOString();

    writeJSON('movies.json', catalog);
    res.json({ message: 'Movie updated', movie: catalog.movies[index] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update movie', error: err.message });
  }
});

app.delete('/api/movies/:id', (req, res) => {
  try {
    const catalog = readJSON('movies.json') || { movies: [] };
    const index = catalog.movies.findIndex(m => m.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    catalog.movies.splice(index, 1);
    catalog.lastUpdated = new Date().toISOString();

    writeJSON('movies.json', catalog);
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete movie', error: err.message });
  }
});

// ---- Collections API ----

app.get('/api/collections', (req, res) => {
  try {
    const data = readJSON('collections.json') || { collections: [] };
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to read collections' });
  }
});

app.post('/api/collections', (req, res) => {
  try {
    const data = { ...req.body, lastUpdated: new Date().toISOString() };
    writeJSON('collections.json', data);
    res.json({ message: 'Collections updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update collections' });
  }
});

// ---- Settings API ----

app.get('/api/settings', (req, res) => {
  try {
    const data = readJSON('settings.json') || { siteName: 'CineVault' };
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to read settings' });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const data = { ...req.body, lastUpdated: new Date().toISOString() };
    writeJSON('settings.json', data);
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// ---- Import/Export ----

app.get('/api/export', (req, res) => {
  try {
    const movies = readJSON('movies.json') || { movies: [] };
    const collections = readJSON('collections.json') || { collections: [] };
    const settings = readJSON('settings.json') || {};

    res.json({
      movies,
      collections,
      settings,
      exportedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to export' });
  }
});

app.post('/api/import', (req, res) => {
  try {
    const { movies, collections, settings } = req.body;

    if (movies) {
      movies.lastUpdated = new Date().toISOString();
      writeJSON('movies.json', movies);
    }
    if (collections) {
      collections.lastUpdated = new Date().toISOString();
      writeJSON('collections.json', collections);
    }
    if (settings) {
      settings.lastUpdated = new Date().toISOString();
      writeJSON('settings.json', settings);
    }

    res.json({ message: 'Import successful' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to import', error: err.message });
  }
});

// ---- Start Server ----

app.listen(PORT, () => {
  console.log(`\n  🎬 CineVault Admin Server running at http://localhost:${PORT}`);
  console.log(`  📁 Data directory: ${DATA_DIR}\n`);
});
