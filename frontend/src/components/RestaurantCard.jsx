import { Link } from 'react-router-dom';
import { MapPin, Sparkles, Star } from 'lucide-react';
import { cuisineEmoji, gradientFor, isOpen } from '../utils/format';

export default function RestaurantCard({ restaurant: r }) {
  const open = isOpen(r);
  const rating = Number(r.rating || 0);

  return (
    <Link to={`/restaurants/${r.id}`} className={`card r-card ${open ? '' : 'is-closed'}`}>
      <div className="r-card__art" style={{ background: gradientFor(r.name) }}>
        <span className="r-card__emoji" aria-hidden="true">{cuisineEmoji(r.cuisine)}</span>
        <span className={`pill ${open ? 'pill--green' : 'pill--dark'}`}>{open ? 'Open now' : 'Closed'}</span>
        {rating > 0 ? (
          <span className="rating"><Star size={13} fill="currentColor" /> {rating.toFixed(1)}</span>
        ) : (
          <span className="rating rating--new"><Sparkles size={13} /> New</span>
        )}
      </div>
      <div className="r-card__body">
        <h3>{r.name}</h3>
        <p className="muted">{r.cuisine}</p>
        <p className="r-card__addr"><MapPin size={14} /> {r.address}</p>
      </div>
    </Link>
  );
}
