import { createContext, useCallback, useContext, useRef, useState } from 'react';

const API_URL = (() => { const u = import.meta.env.VITE_API_URL || '/api/'; return u.endsWith('/') ? u : u + '/'; })();

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('so_cart') || '[]'); }
    catch { return []; }
  });
  // syncToken is set by AuthContext after login so cart can sync without circular dep
  const syncTokenRef = useRef(null);
  const syncTimer = useRef(null);

  const save = (updated) => {
    setItems(updated);
    localStorage.setItem('so_cart', JSON.stringify(updated));
    scheduleSyncToServer(updated);
  };

  const scheduleSyncToServer = (updated) => {
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => pushCartToServer(updated), 1500);
  };

  const pushCartToServer = async (cartItems) => {
    const token = syncTokenRef.current;
    if (!token) return;
    try {
      await fetch(`${API_URL}auth/cart/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cart: cartItems }),
      });
    } catch { /* non-critical */ }
  };

  // Called by AuthContext after login — pulls server cart and merges with local
  const syncCartFromServer = useCallback(async (token) => {
    syncTokenRef.current = token;
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}auth/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const { cart: serverCart } = await res.json();
      if (!Array.isArray(serverCart) || serverCart.length === 0) return;
      // Merge: server items + any local-only items not already present
      setItems(prev => {
        const merged = [...serverCart];
        prev.forEach(localItem => {
          const key = `${localItem.id}__${localItem.weight}`;
          const exists = merged.find(i => `${i.id}__${i.weight}` === key);
          if (!exists) merged.push(localItem);
        });
        localStorage.setItem('so_cart', JSON.stringify(merged));
        return merged;
      });
    } catch { /* non-critical */ }
  }, []);

  // cartKey = unique per product+variant combination
  const cartKey = (product) => `${product.id}__${product.weight}`;

  const addToCart = (product) => {
    const qty = product.qty || 1;
    const key = cartKey(product);
    setItems(prev => {
      const existing = prev.find(i => cartKey(i) === key);
      const updated = existing
        ? prev.map(i => cartKey(i) === key ? { ...i, qty: i.qty + qty } : i)
        : [...prev, { ...product, qty }];
      localStorage.setItem('so_cart', JSON.stringify(updated));
      scheduleSyncToServer(updated);
      return updated;
    });
  };

  const removeFromCart = (key) => save(items.filter(i => cartKey(i) !== key));

  const updateQty = (key, qty) => {
    if (qty < 1) { removeFromCart(key); return; }
    save(items.map(i => cartKey(i) === key ? { ...i, qty } : i));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('so_cart');
    pushCartToServer([]);
  };

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total, count, cartKey, syncCartFromServer, syncTokenRef }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
