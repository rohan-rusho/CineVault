import React, { useState, useRef, useEffect } from 'react';

export default function LazyImage({
  src,
  alt,
  fallback,
  className = '',
  style = {},
  sizes,
  srcSet,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observerRef.current.observe(el);

    return () => observerRef.current?.disconnect();
  }, []);

  const handleLoad = () => setLoaded(true);
  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  const imageSrc = error ? (fallback || '') : (isInView ? src : undefined);

  return (
    <div
      ref={imgRef}
      className={`lazy-image-wrapper ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-tertiary)',
        ...style,
      }}
      {...props}
    >
      {/* Skeleton shimmer while loading */}
      {!loaded && (
        <div
          className="skeleton"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
          }}
        />
      )}

      {isInView && (
        <img
          src={imageSrc}
          srcSet={!error ? srcSet : undefined}
          sizes={sizes}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
}
