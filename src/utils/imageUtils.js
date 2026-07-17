/* ============================================
   CineVault — Image Utilities
   ============================================ */

import { TMDB_IMAGE_BASE, IMAGE_SIZES, PLACEHOLDER_IMAGES } from './constants';

/**
 * Get full TMDB image URL from path and size
 */
export function getTMDBImageUrl(path, type = 'poster', size = 'medium') {
  if (!path) return getPlaceholderImage(type);
  const sizeValue = IMAGE_SIZES[type]?.[size] || IMAGE_SIZES[type]?.medium || 'original';
  return `${TMDB_IMAGE_BASE}/${sizeValue}${path}`;
}

/**
 * Get placeholder image for a given type
 */
export function getPlaceholderImage(type = 'poster') {
  return PLACEHOLDER_IMAGES[type] || PLACEHOLDER_IMAGES.poster;
}

/**
 * Get responsive TMDB image srcSet for <img> srcSet attribute
 */
export function getPosterSrcSet(path) {
  if (!path) return '';
  const sizes = IMAGE_SIZES.poster;
  return [
    `${TMDB_IMAGE_BASE}/${sizes.small}${path} 185w`,
    `${TMDB_IMAGE_BASE}/${sizes.medium}${path} 342w`,
    `${TMDB_IMAGE_BASE}/${sizes.large}${path} 500w`,
    `${TMDB_IMAGE_BASE}/${sizes.xlarge}${path} 780w`,
  ].join(', ');
}

/**
 * Get responsive backdrop srcSet
 */
export function getBackdropSrcSet(path) {
  if (!path) return '';
  const sizes = IMAGE_SIZES.backdrop;
  return [
    `${TMDB_IMAGE_BASE}/${sizes.small}${path} 300w`,
    `${TMDB_IMAGE_BASE}/${sizes.medium}${path} 780w`,
    `${TMDB_IMAGE_BASE}/${sizes.large}${path} 1280w`,
  ].join(', ');
}

/**
 * Get profile image URL with fallback
 */
export function getProfileImageUrl(path, size = 'medium') {
  if (!path) return PLACEHOLDER_IMAGES.profile;
  const sizeValue = IMAGE_SIZES.profile[size] || IMAGE_SIZES.profile.medium;
  return `${TMDB_IMAGE_BASE}/${sizeValue}${path}`;
}

/**
 * Get the movie logo from images data (prefers English PNG)
 */
export function getMovieLogo(images) {
  if (!images?.logos?.length) return null;
  // Prefer English logo
  const englishLogo = images.logos.find(l => l.iso_639_1 === 'en');
  const logo = englishLogo || images.logos[0];
  return `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.logo.xlarge}${logo.file_path}`;
}

/**
 * Preload an image and return a promise
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
