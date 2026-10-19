import { createContext, useMemo, useState } from 'react';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
    catch { return []; }
  });
  const save = (next) => {
    localStorage.setItem('cart', JSON.stringify(next));
    setItems(next);
  };
  const addToCart = (product, quantity = 1) => {
    const farmerId = product.farmerId?._id || product.farmerId;
    if (items.length && items.some((item) => String(item.farmerId) !== String(farmerId))) {
      throw new Error('Checkout supports products from one farm at a time. Complete your current farm order first.');
    }
    const existing = items.find((item) => String(item._id) === String(product._id));
    const next = existing
      ? items.map((item) => item._id === product._id ? { ...item, quantity: Math.min(item.quantity + quantity, product.quantityAvailable) } : item)
      : [...items, { ...product, farmerId, quantity: Math.min(quantity, product.quantityAvailable) }];
    save(next);
  };
  const removeFromCart = (id) => save(items.filter((item) => String(item._id) !== String(id)));
  const clearCart = () => save([]);
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const value = useMemo(() => ({ items, addToCart, removeFromCart, clearCart, cartTotal }), [items, cartTotal]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
