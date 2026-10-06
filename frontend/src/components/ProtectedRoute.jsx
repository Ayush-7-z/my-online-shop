import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../context/AuthContext";

// Sends visitors who are not signed in to /login and brings them back afterwards.
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
}
