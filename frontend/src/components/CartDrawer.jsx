import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { money } from '../utils/format';
import { VegMark } from './FoodItemCard';

export default function CartDrawer() {
  const { open, setOpen, items, restaurant, total, count, changeQty, removeItem, clear } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, setOpen]);

  const checkout = () => {
    setOpen(false);
    navigate('/checkout');
  };

  return (
    <div className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer__backdrop" onClick={() => setOpen(false)} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Your cart">
        <header className="drawer__head">
          <div>
            <h2>Your cart</h2>
            {restaurant && <p className="muted">from {restaurant.name}</p>}
          </div>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close cart"><X size={20} /></button>
        </header>

        {items.length === 0 ? (
          <div className="drawer__empty">
            <span className="empty__emoji" aria-hidden="true"><ShoppingBag size={34} /></span>
            <h3>Your cart is empty</h3>
            <p className="muted">Add something delicious from a restaurant.</p>
            <button className="btn btn--primary" onClick={() => { setOpen(false); navigate('/'); }}>Browse restaurants</button>
          </div>
        ) : (
          <>
            <ul className="drawer__list">
              {items.map((i) => (
                <li key={i.foodItemId} className="cart-line">
                  <VegMark veg={i.veg} />
                  <div className="cart-line__name">
                    <strong>{i.foodItemName}</strong>
                    <span className="muted">{money(i.price)} each</span>
                  </div>
                  <div className="stepper" role="group" aria-label={`Quantity of ${i.foodItemName}`}>
                    <button type="button" onClick={() => changeQty(i.foodItemId, -1)} aria-label="Remove one"><Minus size={15} /></button>
                    <span>{i.quantity}</span>
                    <button type="button" onClick={() => changeQty(i.foodItemId, 1)} aria-label="Add one more"><Plus size={15} /></button>
                  </div>
                  <strong className="cart-line__total">{money(i.price * i.quantity)}</strong>
                  <button className="icon-btn icon-btn--sm" onClick={() => removeItem(i.foodItemId)} aria-label={`Remove ${i.foodItemName}`}>
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="drawer__foot">
              <div className="sum-row">
                <span>{count} {count === 1 ? 'item' : 'items'}</span>
                <button className="link-btn" onClick={clear}>Clear cart</button>
              </div>
              <div className="sum-row sum-row--total">
                <span>Total</span>
                <strong>{money(total)}</strong>
              </div>
              <button className="btn btn--primary btn--block" onClick={checkout}>Proceed to checkout</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
