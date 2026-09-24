import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const StoreContext = createContext(null);
const CART_KEY = "vasky-cart-v2";
const FAV_KEY = "vasky-favorites-v2";
const USER_KEY = "vasky-user-v2";
const ORDERS_KEY = "vasky-orders-v2";

function read(key, fb) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fb;
  } catch { return fb; }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCart(read(CART_KEY, []));
    setFavorites(read(FAV_KEY, []));
    setUser(read(USER_KEY, null));
    setMyOrders(read(ORDERS_KEY, []));
    setLoaded(true);
  }, []);

  useEffect(() => { if (loaded) { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {} } }, [cart, loaded]);
  useEffect(() => { if (loaded) { try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); } catch {} } }, [favorites, loaded]);
  useEffect(() => { if (loaded) { try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {} } }, [user, loaded]);
  useEffect(() => { if (loaded) { try { localStorage.setItem(ORDERS_KEY, JSON.stringify(myOrders)); } catch {} } }, [myOrders, loaded]);

  const showToast = useCallback((msg, link) => {
    setToast({ msg, link });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 3500);
  }, []);

  const addToCart = useCallback((id, size, qty = 1, stock = 99, opts = {}) => {
    let capped = false;
    setCart((items) => {
      const found = items.find((i) => i.id === id && i.size === size);
      if (found) {
        const next = Math.min(found.qty + qty, Math.max(1, stock));
        capped = found.qty + qty > stock;
        return items.map((i) => (i === found ? { ...i, qty: next } : i));
      }
      const q = Math.min(qty, Math.max(1, stock));
      capped = qty > stock;
      return [...items, { id, size, qty: q, color: opts.color || null }];
    });
    showToast(capped ? "Only " + stock + " left in size " + size : "Added to cart", { href: "/cart", label: "VIEW CART" });
  }, [showToast]);

  const updateQty = useCallback((id, size, qty, stock = 99) => {
    setCart((items) => {
      if (qty <= 0) return items.filter((i) => !(i.id === id && i.size === size));
      const q = Math.min(qty, Math.max(1, stock));
      return items.map((i) => (i.id === id && i.size === size ? { ...i, qty: q } : i));
    });
  }, []);

  const removeItem = useCallback((id, size) => {
    setCart((items) => items.filter((i) => !(i.id === id && i.size === size)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback((id) => {
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  }, []);

  const recordOrder = useCallback((order) => {
    setMyOrders((o) => [order.number, ...o].slice(0, 50));
  }, []);

  const value = useMemo(() => ({
    cart, favorites, user, myOrders, toast, showToast,
    cartCount: cart.reduce((n, i) => n + i.qty, 0),
    addToCart, updateQty, removeItem, clearCart,
    toggleFavorite, setUser, recordOrder,
    isFav: (id) => favorites.includes(id),
  }), [cart, favorites, user, myOrders, toast, showToast, addToCart, updateQty, removeItem, clearCart, toggleFavorite, recordOrder]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error("useStore must be used within StoreProvider");
  return s;
}
