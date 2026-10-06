import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const banners = [
  { id: 1, title: "Summer Sale", subtitle: "Up to 50% off on Appliances", image: "https://consumer.bluestarindia.com/cdn/shop/files/Summer-sale_1800x473_87f365e2-d948-44a4-9080-5e24a0e0a438.jpg?v=1776763912&width=1800" },
  { id: 2, title: "New Arrivals", subtitle: "Latest Laptops & Gadgets", image: "/images/banners/new-arrivals.jpg", centerContent: true },
  { id: 3, title: "Deals of the Day", subtitle: "Best Prices on Home Appliances", image: "https://www.oneplus.in/content/dam/oneplus/prado/HeroBanner_Prado_Desktop.jpg", centerContent: true },
];

function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % banners.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero">
      {banners.map((b, i) => (
        <div key={b.id} className={`hero-slide ${i === current ? "active" : ""} ${b.image ? (b.centerContent ? "hero-slide--center" : "hero-slide--summer") : ""}`} style={b.image ? { backgroundImage: `url(${b.image})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: b.gradient }}>
          <div className="hero-content">
            {(b.centerContent || !b.image) && <h2>{b.title}</h2>}
            <p>{b.subtitle}</p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary">Shop Now</Link>
              <Link to="/offers" className="btn btn-secondary">Offers</Link>
            </div>
          </div>
        </div>
      ))}
      <div className="hero-dots">
        {banners.map((_, i) => (
          <span key={i} className={`dot ${i === current ? "active" : ""}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </section>
  );
}

export default Hero;
