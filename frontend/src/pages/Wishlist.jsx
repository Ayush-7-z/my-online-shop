import { Link } from "react-router-dom";
import useCart from "../context/CartContext";
import useWishlist from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import "./Wishlist.css";

function Wishlist() {
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <h1>Wishlist</h1>
        <p className="wishlist-empty">Your wishlist is empty. <Link to="/products">Browse products</Link></p>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h1>Wishlist ({wishlist.length})</h1>
      <div className="wishlist-grid">
        {wishlist.map((item) => (
          <ProductCard key={item.id} product={item} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} inWishlist={isInWishlist(item.id)} />
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
