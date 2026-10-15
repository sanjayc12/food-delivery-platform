import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Leaf, MapPin, Search, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { endpoints, errorMessage } from '../api/client';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { cuisineEmoji, gradientFor, isOpen, isVeg, money } from '../utils/format';
import FoodItemCard from '../components/FoodItemCard';
import { EmptyState, ErrorState } from '../components/States';

export default function RestaurantMenu() {
  const { id } = useParams();
  const toast = useToast();
  const cart = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setRestaurant(null);
    setItems(null);
    try {
      const [r, m] = await Promise.all([endpoints.restaurant(id), endpoints.menu(id)]);
      setRestaurant(r.data);
      setItems(Array.isArray(m.data) ? m.data : []);
    } catch (err) {
      setError(err.response?.status === 404 ? 'We could not find that restaurant.' : errorMessage(err, 'Could not load the menu'));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items || []).filter(
      (i) => (!vegOnly || isVeg(i)) && `${i.name} ${i.description || ''}`.toLowerCase().includes(q),
    );
  }, [items, query, vegOnly]);

  const add = (item) => {
    const result = cart.addItem(restaurant, item);
    if (result === 'conflict') {
      const ok = window.confirm(
        `Your cart has items from ${cart.restaurant?.name}. Start a new cart with ${restaurant.name}?`,
      );
      if (ok) {
        cart.addItem(restaurant, item, { replace: true });
        toast.info(`Started a new cart with ${restaurant.name}`);
      }
      return;
    }
    toast.success(`${item.name} added`);
  };

  if (error) {
    return (
      <>
        <Link to="/" className="back"><ArrowLeft size={18} /> All restaurants</Link>
        <ErrorState message={error} onRetry={load} />
      </>
    );
  }

  if (!restaurant || !items) {
    return (
      <div aria-hidden="true">
        <div className="skeleton skeleton--banner" />
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton skeleton--row" />)}
      </div>
    );
  }

  const open = isOpen(restaurant);
  const rating = Number(restaurant.rating || 0);
  const inThisCart = cart.restaurant?.id === restaurant.id;

  return (
    <>
      <Link to="/" className="back"><ArrowLeft size={18} /> All restaurants</Link>

      <section className="banner" style={{ background: gradientFor(restaurant.name) }}>
        <div className="banner__text">
          <span className={`pill ${open ? 'pill--green' : 'pill--dark'}`}>{open ? 'Open now' : 'Closed right now'}</span>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.cuisine}</p>
          <div className="banner__meta">
            <span><MapPin size={15} /> {restaurant.address}</span>
            {rating > 0 ? <span><Star size={15} fill="currentColor" /> {rating.toFixed(1)}</span> : <span><Sparkles size={15} /> New on FoodRush</span>}
          </div>
        </div>
        <span className="banner__emoji" aria-hidden="true">{cuisineEmoji(restaurant.cuisine)}</span>
      </section>

      <div className="menu-tools">
        <label className="search search--sm">
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this menu" aria-label="Search this menu" />
        </label>
        <button className={`chip ${vegOnly ? 'is-active is-veg' : ''}`} onClick={() => setVegOnly((v) => !v)} aria-pressed={vegOnly}>
          <Leaf size={15} /> Veg only
        </button>
      </div>

      {!open && <div className="alert alert--warn">This restaurant is closed right now - you can browse the menu but not order.</div>}

      {items.length === 0 ? (
        <EmptyState emoji="📋" title="The menu is empty" text="This restaurant has not added any dishes yet.">
          <Link className="btn btn--ghost" to="/manage">Add dishes</Link>
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState emoji="🔎" title="No dishes match" text="Try a different search or turn off the veg filter." />
      ) : (
        <div className="menu-list">
          {visible.map((item) => (
            <FoodItemCard
              key={item.id}
              item={item}
              disabled={!open}
              qty={inThisCart ? cart.qtyOf(item.id) : 0}
              onAdd={() => add(item)}
              onInc={() => cart.changeQty(item.id, 1)}
              onDec={() => cart.changeQty(item.id, -1)}
            />
          ))}
        </div>
      )}

      {inThisCart && cart.count > 0 && (
        <button className="cart-bar" onClick={() => cart.setOpen(true)}>
          <span><ShoppingBag size={18} /> {cart.count} {cart.count === 1 ? 'item' : 'items'}</span>
          <strong>View cart · {money(cart.total)}</strong>
        </button>
      )}
    </>
  );
}
