import { Link } from 'react-router-dom';
import { Utensils } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__content">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Link to="/" className="brand" aria-label="FoodRush home">
              <span className="brand__mark"><Utensils size={18} /></span>
              <span className="brand__name">Food<b>Rush</b></span>
            </Link>
            <p>Good food, delivered with a little more joy. Find local favourites and follow every order to your door.</p>
          </div>
          <nav className="site-footer__group" aria-label="Explore">
            <h2>Explore</h2>
            <Link to="/">Home</Link>
            <Link to="/about">About us</Link>
            <Link to="/orders">My orders</Link>
          </nav>
          <nav className="site-footer__group" aria-label="Help and information">
            <h2>Help</h2>
            <Link to="/contact">Contact us</Link>
            <Link to="/orders">Order help</Link>
          </nav>
        </div>
        <div className="site-footer__bottom">
          <small>© {new Date().getFullYear()} FoodRush. All rights reserved.</small>
          <small>Made for good food and the people who love it.</small>
        </div>
      </div>
    </footer>
  );
}
