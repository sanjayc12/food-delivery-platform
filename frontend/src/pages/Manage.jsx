import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Sparkles, Store } from 'lucide-react';
import { endpoints, errorMessage } from '../api/client';
import { seedSampleData } from '../api/sample';
import { useToast } from '../context/ToastContext';
import { cuisineEmoji } from '../utils/format';

const emptyRestaurant = { name: '', cuisine: '', address: '' };
const emptyItem = { restaurantId: '', name: '', description: '', price: '', veg: true };

/** A simple restaurant-owner console so the catalogue can be managed without Postman. */
export default function Manage() {
  const toast = useToast();
  const [restaurants, setRestaurants] = useState([]);
  const [rForm, setRForm] = useState(emptyRestaurant);
  const [iForm, setIForm] = useState(emptyItem);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await endpoints.restaurants();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not load restaurants'));
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const addRestaurant = async (e) => {
    e.preventDefault();
    setBusy('restaurant');
    try {
      const { data } = await endpoints.createRestaurant({
        name: rForm.name.trim(),
        cuisine: rForm.cuisine.trim(),
        address: rForm.address.trim(),
      });
      toast.success(`${data.name} added`);
      setRForm(emptyRestaurant);
      setIForm((f) => ({ ...f, restaurantId: String(data.id) }));
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add restaurant'));
    } finally {
      setBusy('');
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    setBusy('item');
    try {
      // `veg` is the JSON key Spring binds for the Lombok field `boolean isVeg`.
      await endpoints.addFoodItem(iForm.restaurantId, {
        name: iForm.name.trim(),
        description: iForm.description.trim(),
        price: Number(iForm.price),
        veg: iForm.veg,
        isVeg: iForm.veg,
      });
      toast.success(`${iForm.name} added to the menu`);
      setIForm((f) => ({ ...emptyItem, restaurantId: f.restaurantId }));
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add dish'));
    } finally {
      setBusy('');
    }
  };

  const seed = async () => {
    setBusy('seed');
    try {
      await seedSampleData();
      toast.success('Sample restaurants added');
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add sample data'));
    } finally {
      setBusy('');
    }
  };

  return (
    <>
      <div className="section-head">
        <div>
          <h1 className="page-title">Manage catalogue</h1>
          <p className="muted">Add restaurants and dishes that customers can order.</p>
        </div>
        <button className="btn btn--ghost" onClick={seed} disabled={!!busy}>
          {busy === 'seed' ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Load sample data
        </button>
      </div>

      <div className="manage">
        <form className="card panel" onSubmit={addRestaurant}>
          <h2><Store size={20} /> New restaurant</h2>
          <label className="field">
            <span>Name</span>
            <input className="plain" value={rForm.name} onChange={(e) => setRForm({ ...rForm, name: e.target.value })} placeholder="Pizza Palace" required />
          </label>
          <label className="field">
            <span>Cuisine</span>
            <input className="plain" value={rForm.cuisine} onChange={(e) => setRForm({ ...rForm, cuisine: e.target.value })} placeholder="Italian" required />
          </label>
          <label className="field">
            <span>Address</span>
            <input className="plain" value={rForm.address} onChange={(e) => setRForm({ ...rForm, address: e.target.value })} placeholder="45 MG Road" required />
          </label>
          <button className="btn btn--primary" disabled={busy === 'restaurant'}>
            {busy === 'restaurant' ? <Loader2 size={16} className="spin" /> : <Plus size={16} />} Add restaurant
          </button>
        </form>

        <form className="card panel" onSubmit={addItem}>
          <h2><Plus size={20} /> New dish</h2>
          <label className="field">
            <span>Restaurant</span>
            <select className="plain" value={iForm.restaurantId} onChange={(e) => setIForm({ ...iForm, restaurantId: e.target.value })} required>
              <option value="" disabled>Choose a restaurant</option>
              {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Dish name</span>
            <input className="plain" value={iForm.name} onChange={(e) => setIForm({ ...iForm, name: e.target.value })} placeholder="Margherita Pizza" required />
          </label>
          <label className="field">
            <span>Description</span>
            <input className="plain" value={iForm.description} onChange={(e) => setIForm({ ...iForm, description: e.target.value })} placeholder="Classic cheese and tomato" />
          </label>
          <div className="field-row">
            <label className="field">
              <span>Price (₹)</span>
              <input className="plain" type="number" min="1" step="0.01" value={iForm.price} onChange={(e) => setIForm({ ...iForm, price: e.target.value })} placeholder="250" required />
            </label>
            <label className="switch switch--field">
              <input type="checkbox" checked={iForm.veg} onChange={(e) => setIForm({ ...iForm, veg: e.target.checked })} />
              <span className="switch__track" />
              Vegetarian
            </label>
          </div>
          <button className="btn btn--primary" disabled={busy === 'item' || !iForm.restaurantId}>
            {busy === 'item' ? <Loader2 size={16} className="spin" /> : <Plus size={16} />} Add dish
          </button>
        </form>
      </div>

      <div className="section-head">
        <h2>Your restaurants</h2>
        <span className="muted">{restaurants.length} total</span>
      </div>
      {restaurants.length === 0 ? (
        <p className="muted">Nothing here yet - add a restaurant above or load the sample data.</p>
      ) : (
        <ul className="mini-list">
          {restaurants.map((r) => (
            <li key={r.id}>
              <Link to={`/restaurants/${r.id}`} className="card mini">
                <span className="mini__emoji" aria-hidden="true">{cuisineEmoji(r.cuisine)}</span>
                <div>
                  <strong>{r.name}</strong>
                  <p className="muted">{r.cuisine} · {r.address}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
