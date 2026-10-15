import { NavLink } from 'react-router-dom';
import { ClipboardList, Home, ShoppingBag, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { isAdmin, useAuth } from '../context/AuthContext';

/** Thumb-friendly tab bar, only visible on phones. */
export default function BottomNav() {
  const { count, setOpen } = useCart();
  const { user } = useAuth();
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <NavLink to="/" end>
        <Home size={21} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/orders">
        <ClipboardList size={21} />
        <span>Orders</span>
      </NavLink>
      <button type="button" onClick={() => setOpen(true)}>
        <span className="bottom-nav__icon">
          <ShoppingBag size={21} />
          {count > 0 && <i className="badge">{count}</i>}
        </span>
        <span>Cart</span>
      </button>
      {isAdmin(user) && (
        <NavLink to="/manage">
          <Store size={21} />
          <span>Manage</span>
        </NavLink>
      )}
    </nav>
  );
}
