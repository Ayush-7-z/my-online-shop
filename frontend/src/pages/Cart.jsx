import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../context/CartContext";
import useAuth from "../context/AuthContext";
import ImageViewer from "../components/ImageViewer";
import "./Cart.css";

function Cart() {
  const [viewImg, setViewImg] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, removeCart, increase, decrease, clearCart, totalPrice } = useCart();

  if (cart.length === 0) return <div className="cart-page"><h1>Cart</h1><p className="cart-empty">Your cart is empty.</p></div>;

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Cart ({cart.length} items)</h1>
        <button className="clear-btn" onClick={clearCart} type="button">Clear Cart</button>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => {
            const discounted = item.price - (item.price * item.discount) / 100;
            return (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} onClick={() => setViewImg(item.image)} onError={(e) => { e.target.onerror = null; e.target.src = "/images/placeholder.svg"; }} />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-brand">{item.brand}</p>
                  <p className="cart-item-price">₹{discounted.toLocaleString()}</p>
                </div>
                <div className="cart-qty">
                  <button onClick={() => decrease(item.id)} type="button" aria-label="Decrease quantity">−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => increase(item.id)} type="button" aria-label="Increase quantity">+</button>
                </div>
                <p className="cart-item-total">₹{(discounted * item.qty).toLocaleString()}</p>
                <button className="remove-btn" onClick={() => removeCart(item.id)} type="button" aria-label="Remove item">✕</button>
              </div>
            );
          })}
        </div>

        <aside className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row"><span>Subtotal</span><span>₹{totalPrice.toLocaleString()}</span></div>
          <div className="summary-row"><span>Delivery</span><span>{totalPrice >= 500 ? "Free" : "₹49"}</span></div>
          <div className="summary-row"><span>GST (18%)</span><span>₹{Math.round(totalPrice * 18) / 100}</span></div>
          <div className="summary-total"><span>Total</span><span>₹{(totalPrice + Math.round(totalPrice * 18) / 100 + (totalPrice >= 500 ? 0 : 49)).toLocaleString()}</span></div>
          <button className="checkout-btn" type="button" onClick={() => navigate(user ? "/checkout" : "/login")}>Proceed to Checkout</button>
        </aside>
      </div>

      {viewImg && <ImageViewer src={viewImg} onClose={() => setViewImg(null)} />}
    </div>
  );
}

export default Cart;
