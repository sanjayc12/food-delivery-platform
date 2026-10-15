import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ShoppingBag, Utensils } from 'lucide-react';
import { isAdmin, useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count, setOpen } = useCart();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link to="/" className="brand" aria-label="FoodRush home">
          <span className="brand__mark"><Utensils size={18} /></span>
          <span className="brand__name">Food<b>Rush</b></span>
        </Link>

        <nav className="nav__links" aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/orders">My orders</NavLink>
          {isAdmin(user) && <NavLink to="/manage">Manage</NavLink>}
        </nav>

        <div className="nav__actions">
          <button className="icon-btn" onClick={() => setOpen(true)} aria-label={`Open cart, ${count} items`}>
            <ShoppingBag size={21} />
            {count > 0 && <span className="badge">{count}</span>}
          </button>
          <div className="user-chip" title={user?.username}>
            <span className="avatar">{user?.username?.[0]?.toUpperCase()}</span>
            <span className="user-chip__name">{user?.username}</span>
          </div>
          <button
            className="icon-btn"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            aria-label="Sign out"
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
