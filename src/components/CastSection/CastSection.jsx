import React from 'react';
import LazyImage from '@/components/common/LazyImage';
import { getProfileImageUrl } from '@/utils/imageUtils';
import { PLACEHOLDER_IMAGES } from '@/utils/constants';
import './CastSection.css';

export default function CastSection({ cast }) {
  if (!cast?.length) return null;

  return (
    <section className="cast-section">
      <h3 className="cast-section__title">Cast</h3>
      <div className="cast-section__scroll hide-scrollbar">
        {cast.map((person) => (
          <div key={person.id || person.credit_id} className="cast-card">
            <LazyImage
              src={getProfileImageUrl(person.profile_path, 'medium')}
              alt={person.name}
              fallback={PLACEHOLDER_IMAGES.profile}
              className="cast-card__image"
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                flexShrink: 0,
              }}
            />
            <div className="cast-card__info">
              <div className="cast-card__name text-truncate">{person.name}</div>
              <div className="cast-card__character text-truncate">{person.character}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
