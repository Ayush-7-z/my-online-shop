import { createContext, useContext, useState, useEffect, useCallback } from "react";
import useAuth from "../context/AuthContext";
import { api } from "../api";

const WishlistContext = createContext(null);

const readLocalWishlist = () => JSON.parse(localStorage.getItem("wishlist") || "[]");

const fetchWishlist = (setter) =>
  api("wishlist.php").then((d) => { if (d.success) setter(d.wishlist); });

// Merge the guest wishlist into the account wishlist after login (POST only adds, never removes).
const syncWishlistToAPI = (local) =>
  Promise.all(local.map((item) => api("wishlist.php", { method: "POST", body: { product_id: item.id } })));

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist on mount / user change
  useEffect(() => {
    if (user) {
      syncWishlistToAPI(readLocalWishlist()).then((results) => {
        if (results.every((r) => r.success)) localStorage.removeItem("wishlist");
        fetchWishlist(setWishlist);
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resync from localStorage when auth changes
      setWishlist(readLocalWishlist());
    }
  }, [user]);

  // Guests keep their wishlist in localStorage
  useEffect(() => {
    if (!user) localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist, user]);

  const isInWishlist = useCallback((id) => wishlist.some((item) => item.id === id), [wishlist]);

  const removeFromWishlist = useCallback((id) => {
    if (user) api("wishlist.php", { method: "DELETE", body: { product_id: id } }).then(() => fetchWishlist(setWishlist));
    else setWishlist((prev) => prev.filter((item) => item.id !== id));
  }, [user]);

  const toggleWishlist = useCallback((product) => {
    if (isInWishlist(product.id)) return removeFromWishlist(product.id);
    if (user) api("wishlist.php", { method: "POST", body: { product_id: product.id } }).then(() => fetchWishlist(setWishlist));
    else setWishlist((prev) => [...prev, product]);
  }, [user, isInWishlist, removeFromWishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export default function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
