import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../context/AuthContext";
import { api } from "../api";
import "./Checkout.css";

const statusColors = {
  pending: "#f39c12", confirmed: "#27ae60", shipped: "#3498db",
  delivered: "#2ecc71", cancelled: "#e74c3c",
};

function Orders() {
  const { user } = useAuth();
  const userId = user?.id;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    api("orders.php").then((d) => {
      if (d.success) setOrders(d.orders);
      setLoading(false);
    });
  }, [userId]);

  return (
    <div className="checkout-page">
      <h1>My Orders</h1>
      {loading && <p style={{ textAlign: "center", color: "#999", marginTop: 40 }}>Loading orders...</p>}
      {!loading && orders.length === 0 && (
        <p style={{ textAlign: "center", color: "#999", marginTop: 40 }}>
          No orders yet. <Link to="/products" style={{ color: "#667eea" }}>Start shopping</Link>
        </p>
      )}
      {orders.map((order) => (
        <div key={order.id} className="order-card" style={{
          background: "#1e1e1e", borderRadius: 10, padding: 20, marginBottom: 16,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <strong>Order #{order.id}</strong>
              <span style={{ color: "#999", fontSize: 13, marginLeft: 10 }}>
                {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <span style={{
              background: statusColors[order.status] || "#666", color: "#fff",
              padding: "3px 12px", borderRadius: 12, fontSize: 12, textTransform: "capitalize",
            }}>{order.status}</span>
          </div>

          <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 10 }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "6px 0" }}>
                {item.image && (
                  <img src={item.image} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6 }} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14 }}>{item.name || `Product #${item.product_id}`}</p>
                  <p style={{ fontSize: 12, color: "#999" }}>Qty: {item.quantity}</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #2a2a2a", marginTop: 10, paddingTop: 10, textAlign: "right" }}>
            <span style={{ fontSize: 13, color: "#999" }}>Total: </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#667eea" }}>₹{order.total_amount.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Orders;
