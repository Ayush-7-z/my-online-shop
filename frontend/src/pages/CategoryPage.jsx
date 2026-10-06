import { useParams } from "react-router-dom";
import products from "../data/products";
import ProductCard from "../components/ProductCard";
import useCart from "../context/CartContext";
import useWishlist from "../context/WishlistContext";
import "./Products.css";

const labels = {
  Laptop: "Laptops", Mobile: "Mobiles", Refrigerator: "Refrigerators",
  "Washing Machine": "Washing Machines", AC: "Air Conditioners",
};

const catMap = {
  laptops: "Laptop", mobiles: "Mobile", refrigerators: "Refrigerator",
  "washing-machines": "Washing Machine", ac: "AC",
};

function CategoryPage() {
  const { category } = useParams();
  const cat = catMap[category];
  const filtered = products.filter((p) => p.category === cat);
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  return (
    <div className="products-page">
      <h1>{labels[cat] || category}</h1>
      <div className="products-grid">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} inWishlist={wishlist.some((w) => w.id === p.id)} />
        ))}
      </div>
    </div>
  );
}

export default CategoryPage;
