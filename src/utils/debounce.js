/* ============================================
   CineVault — Debounce Utility
   ============================================ */

/**
 * Creates a debounced function that delays invocation until after
 * `delay` milliseconds have elapsed since the last call.
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  const debounced = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
}

/**
 * Creates a throttled function that only invokes fn at most once
 * per every `limit` milliseconds.
 */
export function throttle(fn, limit = 200) {
  let inThrottle = false;
  let lastArgs = null;

  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}
