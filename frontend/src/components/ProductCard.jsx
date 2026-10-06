import { useState } from 'react';
import { Link } from 'react-router-dom';
import ImageViewer from './ImageViewer';
import './ProductCard.css';

function ProductCard({ product, onAddToCart, onToggleWishlist, inWishlist }) {
  const [viewImg, setViewImg] = useState(null);
  const { id, name, brand, price, discount, rating, image } = product;
  const discounted = price - (price * discount) / 100;

  return (
    <div className="product-card">
      <div className="product-card-image">
        <img src={image} alt={name} onClick={() => setViewImg(image)} onError={(e) => { e.target.onerror = null; e.target.src = "/images/placeholder.svg"; }} />
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        <button className={`wishlist-btn ${inWishlist ? "active" : ""}`} onClick={() => onToggleWishlist(product)} type="button">♥</button>
      </div>
      {viewImg && <ImageViewer src={viewImg} onClose={() => setViewImg(null)} />}
      <div className="product-card-body">
        <h3 className="product-name">{name}</h3>
        <p className="product-brand">{brand}</p>
        <div className="product-rating">
          <span className="stars">{"★".repeat(Math.floor(rating))}☆</span>
          <span className="rating-value">{rating}</span>
        </div>
        <div className="product-price">
          <span className="current-price">₹{discounted.toLocaleString()}</span>
          {discount > 0 && <span className="original-price">₹{price.toLocaleString()}</span>}
        </div>
        <Link to={`/product/${id}`} className="view-details-btn">View Details</Link>
        <button className="add-to-cart-btn" onClick={() => onAddToCart(product)} type="button">Add to Cart</button>
      </div>
    </div>
  );
}

export default ProductCard;
