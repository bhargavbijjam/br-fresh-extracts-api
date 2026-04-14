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

  const addToCart = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      const updated = existing
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }];
      localStorage.setItem('so_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (id) => save(items.filter(i => i.id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    save(items.map(i => i.id === id ? { ...i, qty } : i));
  };

  const clearCart = () => { setItems([]); localStorage.removeItem('so_cart'); };

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
