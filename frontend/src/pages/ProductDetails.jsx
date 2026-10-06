import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import products from "../data/products";
import useCart from "../context/CartContext";
import ImageViewer from "../components/ImageViewer";
import "./ProductDetails.css";

const reviews = [
  { name: "Priya S.", text: "Amazing products! Got my laptop in 2 days.", rating: 5 },
  { name: "Rahul K.", text: "Best prices online. Highly recommended!", rating: 4 },
  { name: "Ananya M.", text: "Great customer support. Helped me with my order.", rating: 5 },
];

function Accordion({ title, children, openByDefault = false }) {
  const [open, setOpen] = useState(openByDefault);
  return (
    <div className={`accordion${open ? " open" : ""}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {title}
        <span className="chevron" aria-hidden="true">▾</span>
      </button>
      <div className="accordion-body"><div>{children}</div></div>
    </div>
  );
}

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [viewImg, setViewImg] = useState(null);
  const [selected, setSelected] = useState(null);
  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="product-details-page">
        <h1>Product not found</h1>
        <Link to="/products">Back to Products</Link>
      </div>
    );
  }

  const discounted = product.price - (product.price * product.discount) / 100;

  return (
    <div className="product-details-page">
      <Link to="/products" className="back-link">← Back to Products</Link>

      <div className="product-layout">
        <div className="product-media">
          <img src={product.image} alt={product.name} onClick={() => setViewImg(product.image)}
            onError={(e) => { e.target.onerror = null; e.target.src = "/images/placeholder.svg"; }} />
        </div>

        <div className="product-info">
          <p className="product-brand-tag">{product.brand}</p>
          <h1>{product.name}</h1>
          <p className="product-rating-line"><span className="stars">{"★".repeat(Math.round(product.rating))}</span> {product.rating} · {product.stock} in stock</p>

          <div className="product-price-row">
            <span className="product-price">₹{discounted.toLocaleString()}</span>
            {product.discount > 0 && (
              <>
                <span className="product-original">₹{product.price.toLocaleString()}</span>
                <span className="product-discount">-{product.discount}%</span>
              </>
            )}
          </div>

          {["RAM", "Storage", "Display"].filter((k) => product.specs?.[k]).map((key) => (
            <div className="chip-group" key={key}>
              <p className="chip-label">{key}</p>
              <div className="chips">
                <button type="button" className={`chip${selected === product.specs[key] ? " selected" : ""}`} onClick={() => setSelected(product.specs[key])}>{product.specs[key]}</button>
              </div>
            </div>
          ))}

          <button className="add-to-cart-big" onClick={() => addToCart(product)} type="button">Add to Cart</button>

          <Accordion title="Specifications" openByDefault>
            <table className="specs-table">
              <tbody>
                {Object.entries(product.specs).map(([key, value]) => (
                  <tr key={key}>
                    <td className="spec-key">{key}</td>
                    <td className="spec-value">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Accordion>

          <Accordion title="Shipping & Returns">
            <p>Free delivery on orders above ₹500. Standard delivery in 3–5 business days. 7-day hassle-free returns.</p>
          </Accordion>
        </div>
      </div>

      <section className="product-reviews">
        <h2 className="product-reviews-title">What Our Customers Say</h2>
        <div className="product-reviews-grid">
          {reviews.map((r, i) => (
            <div key={i} className="product-review-card">
              <div className="product-review-stars">{"★".repeat(r.rating)}</div>
              <p className="product-review-text">"{r.text}"</p>
              <p className="product-review-name">— {r.name}</p>
            </div>
          ))}
        </div>
      </section>

      {viewImg && <ImageViewer src={viewImg} onClose={() => setViewImg(null)} />}
    </div>
  );
}

export default ProductDetails;
