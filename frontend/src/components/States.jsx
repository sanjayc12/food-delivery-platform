import { AlertTriangle, RefreshCw } from 'lucide-react';

export function CardSkeletons({ count = 6 }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card skeleton-card" aria-hidden="true">
          <div className="skeleton skeleton--art" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state card" role="alert">
      <span className="state__icon state__icon--red"><AlertTriangle size={28} /></span>
      <h3>We hit a snag</h3>
      <p className="muted">{message}</p>
      {onRetry && (
        <button className="btn btn--ghost" onClick={onRetry}><RefreshCw size={16} /> Try again</button>
      )}
    </div>
  );
}

export function EmptyState({ emoji = '🍽️', title, text, children }) {
  return (
    <div className="state card">
      <span className="state__emoji" aria-hidden="true">{emoji}</span>
      <h3>{title}</h3>
      {text && <p className="muted">{text}</p>}
      {children}
    </div>
  );
}
