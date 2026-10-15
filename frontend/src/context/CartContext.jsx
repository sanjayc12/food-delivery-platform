import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const CART_KEY = 'fd_cart';
const emptyCart = () => ({ restaurant: null, items: [] });

function load(key) {
  if (!key) return emptyCart();
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && Array.isArray(saved.items)) return saved;
  } catch {
    /* ignore corrupted cart */
  }
  return emptyCart();
}

/**
 * The backend models one restaurant per order, so the cart holds items from a single restaurant.
 * Adding from a different restaurant returns 'conflict' until the caller passes { replace: true }.
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const storageKey = user
    ? `${CART_KEY}_${encodeURIComponent(user.id ?? user.username)}`
    : null;
  const [storedCart, setStoredCart] = useState(() => ({
    storageKey,
    cart: load(storageKey),
  }));
  const cart = storedCart.storageKey === storageKey ? storedCart.cart : emptyCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setStoredCart({ storageKey, cart: load(storageKey) });
    setOpen(false);
  }, [storageKey]);

  useEffect(() => {
    if (storageKey && storedCart.storageKey === storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(storedCart.cart));
    }
  }, [storageKey, storedCart]);

  const updateCart = useCallback((update) => {
    setStoredCart((prev) => {
      const current = prev.storageKey === storageKey ? prev.cart : load(storageKey);
      return { storageKey, cart: update(current) };
    });
  }, [storageKey]);

  const addItem = useCallback((restaurant, item, { replace = false } = {}) => {
    let result = 'added';
    updateCart((prev) => {
      const sameRestaurant = !prev.restaurant || prev.restaurant.id === restaurant.id;
      if (!sameRestaurant && !replace) {
        result = 'conflict';
        return prev;
      }
      const base = sameRestaurant ? prev : { restaurant: null, items: [] };
      const existing = base.items.find((i) => i.foodItemId === item.id);
      const items = existing
        ? base.items.map((i) => (i.foodItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [
            ...base.items,
            {
              foodItemId: item.id,
              foodItemName: item.name,
              price: Number(item.price),
              quantity: 1,
              veg: !!(item.veg ?? item.isVeg),
            },
          ];
      return { restaurant: { id: restaurant.id, name: restaurant.name, cuisine: restaurant.cuisine }, items };
    });
    return result;
  }, [updateCart]);

  const changeQty = useCallback((foodItemId, delta) => {
    updateCart((prev) => {
      const items = prev.items
        .map((i) => (i.foodItemId === foodItemId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0);
      return items.length ? { ...prev, items } : { restaurant: null, items: [] };
    });
  }, [updateCart]);

  const removeItem = useCallback((foodItemId) => {
    updateCart((prev) => {
      const items = prev.items.filter((i) => i.foodItemId !== foodItemId);
      return items.length ? { ...prev, items } : { restaurant: null, items: [] };
    });
  }, [updateCart]);

  const clear = useCallback(() => updateCart(emptyCart), [updateCart]);

  const value = useMemo(() => {
    const count = cart.items.reduce((n, i) => n + i.quantity, 0);
    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const qtyOf = (id) => cart.items.find((i) => i.foodItemId === id)?.quantity || 0;
    return { ...cart, count, total, qtyOf, addItem, changeQty, removeItem, clear, open, setOpen };
  }, [cart, open, addItem, changeQty, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
