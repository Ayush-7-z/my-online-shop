import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useCart from '../context/CartContext';
import useWishlist from '../context/WishlistContext';
import useAuth from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth();
  const cls = () => setOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?q=${encodeURIComponent(search.trim())}`);
    setOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo">ShopEase</NavLink>
        <form className="navbar-search" onSubmit={handleSearch}>
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit">Search</button>
        </form>
        <div className={`navbar-links ${open ? "open" : ""}`}>
          <NavLink to="/" onClick={cls}>Home</NavLink>
          <NavLink to="/products" onClick={cls}>Products</NavLink>
          <NavLink to="/cart" className="nav-cart" onClick={cls}>Cart{totalItems > 0 && <span className="badge">{totalItems}</span>}</NavLink>
          <NavLink to="/wishlist" className="nav-wishlist" onClick={cls}>Wishlist{wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}</NavLink>
          {user ? (
            <><NavLink to="/orders" onClick={cls}>Orders</NavLink><NavLink to="/profile" onClick={cls}>Profile</NavLink><button className="logout-btn" onClick={logout} type="button">Logout</button></>
          ) : (
            <NavLink to="/login" onClick={cls}>Login</NavLink>
          )}
        </div>
        <button className="hamburger" onClick={() => setOpen(!open)} type="button">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
