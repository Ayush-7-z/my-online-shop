import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import products from "../data/products";
import ProductCard from "../components/ProductCard";
import useCart from "../context/CartContext";
import useWishlist from "../context/WishlistContext";
import "./Home.css";

const categories = [
  { name: "Laptops", path: "/category/laptops", icon: "\uD83D\uDCBB" },
  { name: "Mobiles", path: "/category/mobiles", icon: "\uD83D\uDCF1" },
  { name: "AC", path: "/category/ac", icon: "\u2744\uFE0F" },
  { name: "Refrigerators", path: "/category/refrigerators", icon: "\uD83E\uDDCA" },
  { name: "Washing Machines", path: "/category/washing-machines", icon: "\uD83E\uDDFA" },
];

function Home() {
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const trending = products.filter((p) => p.rating >= 4.6);
  const bestSeller = products.filter((p) => p.stock > 10).slice(0, 5);
  const deals = products.filter((p) => p.discount >= 12);

  const renderSection = (title, items, viewAll) => (
    <section className="section">
      {viewAll ? (
        <div className="section-header"><h2>{title}</h2><Link to={viewAll} className="view-all">View All</Link></div>
      ) : (
        <h2>{title}</h2>
      )}
      <div className="product-row">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} inWishlist={wishlist.some((w) => w.id === p.id)} />
        ))}
      </div>
    </section>
  );

  return (
    <>
      <Hero />
      <section className="section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link key={cat.name} to={cat.path} className="category-card">
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>
      {renderSection("Trending Products", trending, "/products")}
      {renderSection("Best Sellers", bestSeller, "/products")}
      {renderSection("Deals of the Day", deals)}
      <section className="section newsletter-section">
        <h2>Subscribe to Our Newsletter</h2>
        <p>Get the latest deals and offers straight to your inbox.</p>
        <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); }}>
          <input type="email" placeholder="Enter your email" required />
          <button type="submit">Subscribe</button>
        </form>
      </section>
    </>
  );
}

export default Home;
