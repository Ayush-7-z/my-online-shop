import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <h1 style={{ fontSize: 72, margin: 0, color: "#667eea" }}>404</h1>
      <p style={{ fontSize: 20, margin: "16px 0" }}>Page not found</p>
      <Link to="/" style={{ color: "#667eea", fontSize: 16 }}>Go Home</Link>
    </div>
  );
}
export default NotFound;
