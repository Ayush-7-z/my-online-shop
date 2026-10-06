import { createContext, useContext, useState, useEffect } from "react";
import { api, SESSION_EXPIRED } from "../api";

const AuthContext = createContext(null);

// The cached user only avoids a login flash on reload; the server session is the source of truth.
const readCachedUser = () => {
  try { return JSON.parse(localStorage.getItem("currentUser")); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readCachedUser);

  useEffect(() => {
    if (user) localStorage.setItem("currentUser", JSON.stringify(user));
    else localStorage.removeItem("currentUser");
  }, [user]);

  // Validate the session on load, and sign out whenever any request reports it has expired.
  useEffect(() => {
    api("session.php").then((d) => { if (d.success) setUser(d.user); });
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED, onExpired);
  }, []);

  // login/register resolve to { ok, message, status }; the server signs the user in on success.
  const authenticate = async (endpoint, body, failure) => {
    const d = await api(endpoint, { method: "POST", body });
    if (!d.success) return { ok: false, message: d.error || failure, status: d.status };
    setUser(d.user);
    return { ok: true };
  };

  const register = (name, email, phone, password) =>
    authenticate("register.php", { name, email, phone, password }, "Registration failed");

  const login = (email, password) =>
    authenticate("login.php", { email, password }, "Invalid email or password");

  const logout = async () => {
    await api("session.php", { method: "DELETE" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
