import { Link } from "react-router-dom";
import useAuth from "../context/AuthContext";

function Profile() {
  const { user, logout } = useAuth();
  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Profile</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone:</strong> {user.phone}</p>
      <Link to="/orders" style={{
        display: "inline-block", padding: "10px 24px", background: "#667eea", color: "#fff",
        border: "none", borderRadius: 6, cursor: "pointer", marginTop: 16, textDecoration: "none",
      }}>My Orders</Link>
      <button onClick={() => { logout(); }} style={{
        padding: "10px 24px", background: "#e74c3c", color: "#fff", border: "none",
        borderRadius: 6, cursor: "pointer", marginLeft: 10,
      }} type="button">Logout</button>
    </div>
  );
}
export default Profile;
