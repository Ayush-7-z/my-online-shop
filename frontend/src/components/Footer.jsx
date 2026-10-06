import { Link } from 'react-router-dom';
import './Footer.css';

const sections = [
  { title: "Quick Links", links: [["Home", "/"], ["Products", "/products"], ["About Us", "/about"], ["Contact", "/contact"], ["Offers", "/offers"]] },
  { title: "Support", links: [["Help Center", "/support"], ["Customer Care", "/customer-care"], ["FAQ", "/faq"], ["Returns", "/returns"]] },
  { title: "Policies", links: [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Shipping Policy", "/shipping"], ["Refund Policy", "/refund"]] },
  { title: "Follow Us", links: [["Facebook", "#"], ["Instagram", "#"], ["Twitter", "#"], ["YouTube", "#"]], external: true },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {sections.map((s) => (
          <div key={s.title} className="footer-section">
            <h3>{s.title}</h3>
            {s.links.map(([label, url]) =>
              s.external ? (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer">{label}</a>
              ) : (
                <Link key={label} to={url}>{label}</Link>
              )
            )}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 ShopEase. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
