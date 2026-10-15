import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { endpoints, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { money } from '../utils/format';
import { rememberOrder } from '../utils/hooks';
import { VegMark } from '../components/FoodItemCard';
import { EmptyState } from '../components/States';

const ADDRESS_KEY = 'fd_address';

export default function Checkout() {
  const { user } = useAuth();
  const addressKey = `${ADDRESS_KEY}_${encodeURIComponent(user.id ?? user.username)}`;
  const cart = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [address, setAddress] = useState(() => localStorage.getItem(addressKey) || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (cart.items.length === 0) {
    return (
      <EmptyState emoji="🛒" title="Your cart is empty" text="Pick a restaurant and add a few dishes first.">
        <Link className="btn btn--primary" to="/">Browse restaurants</Link>
      </EmptyState>
    );
  }

  const placeOrder = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payload = {
        // The order service needs a customer id. It comes from the login response (see README "Backend notes").
        customerId: user.id ?? 1,
        restaurantId: cart.restaurant.id,
        deliveryAddress: address.trim(),
        items: cart.items.map((i) => ({
          foodItemId: i.foodItemId,
          foodItemName: i.foodItemName,
          quantity: i.quantity,
          price: i.price,
        })),
      };
      const { data: order } = await endpoints.placeOrder(payload);
      localStorage.setItem(addressKey, address.trim());
      rememberOrder(user.username, order.orderId, {
        restaurant: cart.restaurant,
        address: address.trim(),
        items: cart.items,
      });
      cart.clear();
      toast.success(`Order #${order.orderId} placed!`);
      navigate(`/orders/${order.orderId}`, { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not place your order'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Link to={`/restaurants/${cart.restaurant.id}`} className="back"><ArrowLeft size={18} /> Back to {cart.restaurant.name}</Link>
      <h1 className="page-title">Checkout</h1>

      <form className="checkout" onSubmit={placeOrder}>
        <section className="card panel">
          <h2><MapPin size={20} /> Delivery address</h2>
          <label className="field">
            <span className="sr-only">Delivery address</span>
            <textarea
              className="textarea"
              rows={4}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House / flat no., street, area, landmark"
              required
              minLength={8}
            />
          </label>
        </section>

        <aside className="card panel checkout__summary">
          <h2>Order summary</h2>
          <p className="muted">{cart.restaurant.name}</p>
          <ul className="summary-list">
            {cart.items.map((i) => (
              <li key={i.foodItemId}>
                <VegMark veg={i.veg} />
                <span>{i.quantity} × {i.foodItemName}</span>
                <strong>{money(i.price * i.quantity)}</strong>
              </li>
            ))}
          </ul>
          <div className="sum-row sum-row--total">
            <span>Total to pay</span>
            <strong>{money(cart.total)}</strong>
          </div>

          {error && <div className="alert alert--error" role="alert">{error}</div>}

          <button className="btn btn--primary btn--block" disabled={busy || address.trim().length < 8}>
            {busy ? <><Loader2 size={18} className="spin" /> Placing order...</> : `Place order · ${money(cart.total)}`}
          </button>
        </aside>
      </form>
    </>
  );
}
