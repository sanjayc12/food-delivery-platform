import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Store } from 'lucide-react';
import { endpoints, errorMessage } from '../api/client';
import { seedSampleData } from '../api/sample';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cuisineEmoji, isOpen } from '../utils/format';
import RestaurantCard from '../components/RestaurantCard';
import { CardSkeletons, EmptyState, ErrorState } from '../components/States';

export default function Home() {
  const { user } = useAuth();
  const toast = useToast();
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [openOnly, setOpenOnly] = useState(false);
  const [seeding, setSeeding] = useState('');

  const load = useCallback(async () => {
    setError('');
    setList(null);
    try {
      const { data } = await endpoints.restaurants();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(errorMessage(err, 'Could not load restaurants'));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cuisines = useMemo(() => ['All', ...new Set((list || []).map((r) => r.cuisine).filter(Boolean))], [list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (list || []).filter(
      (r) =>
        (cuisine === 'All' || r.cuisine === cuisine) &&
        (!openOnly || isOpen(r)) &&
        `${r.name} ${r.cuisine} ${r.address}`.toLowerCase().includes(q),
    );
  }, [list, query, cuisine, openOnly]);

  const seed = async () => {
    try {
      await seedSampleData(setSeeding);
      toast.success('Sample restaurants added');
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add sample data'));
    } finally {
      setSeeding('');
    }
  };

  return (
    <>
      <section className="hero">
        <div className="hero__text">
          <p className="eyebrow">Hi {user?.username} 👋</p>
          <h1>Hungry? Get it delivered <span>hot</span> and track every step.</h1>
          <label className="search">
            <Search size={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurants, cuisines, areas..."
              aria-label="Search restaurants"
            />
          </label>
        </div>
        <div className="hero__art" aria-hidden="true">
          <span>🍔</span><span>🍕</span><span>🍜</span>
        </div>
      </section>

      {list && list.length > 0 && (
        <div className="filters">
          <div className="chips" role="tablist" aria-label="Filter by cuisine">
            {cuisines.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={cuisine === c}
                className={`chip ${cuisine === c ? 'is-active' : ''}`}
                onClick={() => setCuisine(c)}
              >
                {c !== 'All' && <span aria-hidden="true">{cuisineEmoji(c)}</span>} {c}
              </button>
            ))}
          </div>
          <label className="switch">
            <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />
            <span className="switch__track" />
            Open now
          </label>
        </div>
      )}

      <div className="section-head">
        <h2>{cuisine === 'All' ? 'Restaurants near you' : `${cuisine} restaurants`}</h2>
        {list && <span className="muted">{filtered.length} {filtered.length === 1 ? 'place' : 'places'}</span>}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : list === null ? (
        <CardSkeletons />
      ) : list.length === 0 ? (
        <EmptyState emoji="🍽️" title="No restaurants yet" text="Add your first restaurant, or load a few sample ones to explore the app.">
          <div className="state__actions">
            <button className="btn btn--primary" onClick={seed} disabled={!!seeding}>
              {seeding ? <><Loader2 size={18} className="spin" /> {seeding}</> : 'Load sample restaurants'}
            </button>
            <Link className="btn btn--ghost" to="/manage"><Store size={18} /> Add my own</Link>
          </div>
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState emoji="🔎" title="Nothing matches" text="Try a different search or clear the filters.">
          <button className="btn btn--ghost" onClick={() => { setQuery(''); setCuisine('All'); setOpenOnly(false); }}>Clear filters</button>
        </EmptyState>
      ) : (
        <div className="grid">
          {filtered.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
        </div>
      )}
    </>
  );
}
