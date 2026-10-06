import { Link, Navigate, useLocation } from "react-router-dom";
import "./Checkout.css";

function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) return <Navigate to="/cart" />;

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-icon">&#10003;</div>
        <h1>Order Placed Successfully!</h1>
        <p className="confirmation-id">Order ID: #{order.id}</p>
        <p className="confirmation-status">Status: <span className="badge-confirmed">Confirmed</span></p>

        <div className="confirmation-details">
          <h3>Delivery Address</h3>
          <p>{order.address}</p>
        </div>

        <div className="confirmation-items">
          <h3>Items ({order.items.length})</h3>
          {order.items.map((item, i) => (
            <div key={i} className="confirmation-item">
              <span className="confirmation-item-name">{item.name || `Product #${item.product_id}`}</span>
              <span>Qty: {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="confirmation-totals">
          <div className="checkout-total-row"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
          <div className="checkout-total-row"><span>GST (18%)</span><span>₹{order.gst?.toLocaleString()}</span></div>
          <div className="checkout-total-row"><span>Delivery</span><span>{order.delivery_charge === 0 ? "Free" : `₹${order.delivery_charge}`}</span></div>
          <div className="checkout-total-row checkout-total-final"><span>Total</span><span>₹{order.total_amount?.toLocaleString()}</span></div>
        </div>

        <div className="confirmation-actions">
          <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
          <Link to="/profile" className="btn btn-secondary">View Orders</Link>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;
