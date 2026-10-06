import { createContext, useContext, useState, useEffect, useCallback } from "react";
import useAuth from "../context/AuthContext";
import { api } from "../api";

const CartContext = createContext(null);

const readLocalCart = () => JSON.parse(localStorage.getItem("cart") || "[]");
const unitPrice = (item) => item.price - (item.price * item.discount) / 100;

const fetchCart = (setter) =>
  api("cart.php").then((d) => { if (d.success) setter(d.cart); });

// Merge the guest cart into the account cart after login.
const syncCartToAPI = (local) =>
  Promise.all(
    local.map((item) =>
      api("cart.php", { method: "POST", body: { product_id: item.id, quantity: item.qty || 1 } })
    )
  );

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  // Load cart on mount / user change
  useEffect(() => {
    if (user) {
      syncCartToAPI(readLocalCart()).then((results) => {
        if (results.every((r) => r.success)) localStorage.removeItem("cart");
        fetchCart(setCart);
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resync from localStorage when auth changes
      setCart(readLocalCart());
    }
  }, [user]);

  // Guests keep their cart in localStorage
  useEffect(() => {
    if (!user) localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, user]);

  const apiCall = useCallback(async (method, body) => {
    await api("cart.php", { method, body });
    fetchCart(setCart);
  }, []);

  const addToCart = useCallback((product) => {
    if (user) {
      apiCall("POST", { product_id: product.id, quantity: 1 });
    } else {
      setCart((prev) =>
        prev.some((item) => item.id === product.id)
          ? prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
          : [...prev, { ...product, qty: 1 }]
      );
    }
  }, [user, apiCall]);

  const removeCart = useCallback((id) => {
    if (user) apiCall("DELETE", { product_id: id });
    else setCart((prev) => prev.filter((item) => item.id !== id));
  }, [user, apiCall]);

  const changeQty = useCallback((id, delta) => {
    const item = cart.find((i) => i.id === id);
    if (!item || item.qty + delta < 1) return;
    if (user) {
      apiCall("PUT", { product_id: id, quantity: item.qty + delta });
    } else {
      setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)));
    }
  }, [user, apiCall, cart]);

  const increase = useCallback((id) => changeQty(id, 1), [changeQty]);
  const decrease = useCallback((id) => changeQty(id, -1), [changeQty]);

  const clearCart = useCallback(() => {
    if (user) apiCall("DELETE", {}); // no product_id = empty the whole cart
    else setCart([]);
  }, [user, apiCall]);

  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.qty || 1) * unitPrice(item), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeCart, increase, decrease, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export default function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
