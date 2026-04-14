import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('so_cart') || '[]'); }
    catch { return []; }
  });

  const save = (updated) => {
    setItems(updated);
    localStorage.setItem('so_cart', JSON.stringify(updated));
  };

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
      return updated;
    });
  };

  const removeFromCart = (key) => save(items.filter(i => cartKey(i) !== key));

  const updateQty = (key, qty) => {
    if (qty < 1) { removeFromCart(key); return; }
    save(items.map(i => cartKey(i) === key ? { ...i, qty } : i));
  };

  const clearCart = () => { setItems([]); localStorage.removeItem('so_cart'); };

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total, count, cartKey }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
