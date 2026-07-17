/* ============================================
   CineVault — Video Source Service
   Provider-agnostic video source processing
   ============================================ */

/**
 * Video source types
 */
export const SOURCE_TYPES = {
  GOOGLE_DRIVE: 'google_drive',
  DIRECT_URL: 'direct_url',
  EMBED: 'embed',
  UNKNOWN: 'unknown',
};

/**
 * Detect the type of video source from a URL
 */
export function detectSourceType(url) {
  if (!url) return SOURCE_TYPES.UNKNOWN;
  
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    return SOURCE_TYPES.GOOGLE_DRIVE;
  }
  
  // Direct video file extensions
  if (/\.(mp4|webm|mkv|avi|mov|m3u8)(\?|$)/i.test(url)) {
    return SOURCE_TYPES.DIRECT_URL;
  }

  // Iframe embed patterns
  if (url.includes('/embed') || url.includes('/preview')) {
    return SOURCE_TYPES.EMBED;
  }

  return SOURCE_TYPES.UNKNOWN;
}

/**
 * Extract Google Drive file ID from various URL formats
 */
export function extractGoogleDriveId(url) {
  if (!url) return null;

  // Format: https://drive.google.com/file/d/{ID}/view
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  // Format: https://drive.google.com/open?id={ID}
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return openMatch[1];

  // Format: https://docs.google.com/uc?id={ID}
  const ucMatch = url.match(/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) return ucMatch[1];

  // Already just an ID (no slashes or dots)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) return url;

  return null;
}

/**
 * Get Google Drive embed URL for iframe playback
 * This is the officially supported method
 */
export function getGoogleDriveEmbedUrl(fileIdOrUrl) {
  const fileId = extractGoogleDriveId(fileIdOrUrl) || fileIdOrUrl;
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Get Google Drive direct download URL
 */
export function getGoogleDriveDownloadUrl(fileIdOrUrl) {
  const fileId = extractGoogleDriveId(fileIdOrUrl) || fileIdOrUrl;
  if (!fileId) return null;
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Process a video source and return playback-ready URLs
 * Returns an object with embed and direct URLs based on source type
 */
export function processVideoSource(source) {
  if (!source) {
    return {
      type: SOURCE_TYPES.UNKNOWN,
      embedUrl: null,
      directUrl: null,
      downloadUrl: null,
      error: 'No video source provided',
    };
  }

  const type = detectSourceType(source);

  switch (type) {
    case SOURCE_TYPES.GOOGLE_DRIVE: {
      const fileId = extractGoogleDriveId(source);
      if (!fileId) {
        return {
          type,
          embedUrl: null,
          directUrl: null,
          downloadUrl: null,
          error: 'Invalid Google Drive URL',
        };
      }
      return {
        type,
        fileId,
        embedUrl: getGoogleDriveEmbedUrl(fileId),
        directUrl: null, // Direct streaming may not work due to CORS
        downloadUrl: getGoogleDriveDownloadUrl(fileId),
        error: null,
      };
    }

    case SOURCE_TYPES.DIRECT_URL:
      return {
        type,
        embedUrl: null,
        directUrl: source,
        downloadUrl: source,
        error: null,
      };

    case SOURCE_TYPES.EMBED:
      return {
        type,
        embedUrl: source,
        directUrl: null,
        downloadUrl: null,
        error: null,
      };

    default:
      return {
        type: SOURCE_TYPES.UNKNOWN,
        embedUrl: source, // Try as embed
        directUrl: source, // Try as direct
        downloadUrl: null,
        error: null,
      };
  }
}

/**
 * Get the best playback URL for the player
 * Prefers direct URL (HTML5 player) over embed (iframe)
 */
export function getBestPlaybackUrl(source) {
  const processed = processVideoSource(source);
  return processed.directUrl || processed.embedUrl;
}

/**
 * Check if the video source requires iframe embed
 */
export function requiresIframeEmbed(source) {
  const type = detectSourceType(source);
  return type === SOURCE_TYPES.GOOGLE_DRIVE || type === SOURCE_TYPES.EMBED;
}

/**
 * Validate a video source URL format
 */
export function validateVideoSource(url) {
  if (!url) return { valid: false, message: 'URL is required' };
  
  try {
    new URL(url);
  } catch {
    return { valid: false, message: 'Invalid URL format' };
  }

  const type = detectSourceType(url);
  if (type === SOURCE_TYPES.GOOGLE_DRIVE) {
    const fileId = extractGoogleDriveId(url);
    if (!fileId) {
      return { valid: false, message: 'Could not extract Google Drive file ID' };
    }
  }

  return { valid: true, message: 'Valid video source' };
}
