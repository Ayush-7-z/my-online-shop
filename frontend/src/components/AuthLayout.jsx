import { Link } from "react-router-dom";
import { Icon } from "./AuthFields";
import "../pages/Auth.css";

const perks = [
  { text: "Secure checkout and encrypted passwords", icon: <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3Zm-1.5 12.5-3-3 1.4-1.4 1.6 1.6 3.6-3.6 1.4 1.4-5 5Z" /> },
  { text: "Track every order in one place", icon: <><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5M12 13v8" /></> },
  { text: "Cart and wishlist saved to your account", icon: <path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1Z" /> },
];

// Shared two-column shell for Login and Register: brand panel + form. The panel collapses on phones.
export default function AuthLayout({ heading, text, title, subtitle, footer, children }) {
  return (
    <main className="auth-shell">
      <div className="auth-card">
        <aside className="auth-brand">
          <Link to="/" className="auth-logo">ShopEase</Link>
          <h2>{heading}</h2>
          <p>{text}</p>
          <ul className="auth-perks">
            {perks.map((perk) => (
              <li key={perk.text}><Icon size={18}>{perk.icon}</Icon>{perk.text}</li>
            ))}
          </ul>
        </aside>
        <section className="auth-form-side">
          <h1>{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
          <p className="auth-switch">{footer}</p>
        </section>
      </div>
    </main>
  );
}
