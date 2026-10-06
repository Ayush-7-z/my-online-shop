import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import products from "../data/products";
import ProductCard from "../components/ProductCard";
import useCart from "../context/CartContext";
import useWishlist from "../context/WishlistContext";
import "./Products.css";

function Products() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [minRt, setMinRt] = useState(0);

  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const brands = [...new Set(products.map((p) => p.brand))];

  let filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchBrand = !brand || p.brand === brand;
    const matchRating = p.rating >= minRt;
    let matchPrice = true;
    if (price) {
      const [min, max] = price.split("-").map(Number);
      matchPrice = p.price >= min && (max ? p.price <= max : true);
    }
    return matchSearch && matchBrand && matchRating && matchPrice;
  });

  if (sort === "low") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "high") filtered.sort((a, b) => b.price - a.price);
  else if (sort === "rating") filtered.sort((a, b) => b.rating - a.rating);

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Products</h1>
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
      </div>
      <div className="products-layout">
        <aside className="filters">
          <h3>Filters</h3>
          <div className="filter-group">
            <label>Sort</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">None</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Brand</label>
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">All Brands</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Price Range</label>
            <select value={price} onChange={(e) => setPrice(e.target.value)}>
              <option value="">All Prices</option>
              <option value="0-25000">Under ₹25,000</option>
              <option value="25000-50000">₹25,000 - ₹50,000</option>
              <option value="50000-100000">₹50,000 - ₹1,00,000</option>
              <option value="100000-">Above ₹1,00,000</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Min Rating</label>
            <select value={minRt} onChange={(e) => setMinRt(Number(e.target.value))}>
              <option value={0}>Any</option>
              <option value={4}>4+</option>
              <option value={4.5}>4.5+</option>
            </select>
          </div>
        </aside>
        <div className="products-grid">
          {filtered.length === 0 ? <p className="no-products">No products found.</p>
            : filtered.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} inWishlist={wishlist.some((w) => w.id === p.id)} />
            ))}
        </div>
      </div>
    </div>
  );
}

export default Products;
