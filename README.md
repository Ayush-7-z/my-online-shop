# ShopEase — Online Electronics Store

A full-stack e-commerce web application for an electronics store. Built with **HTML, CSS, JavaScript, AngularJS 1.8** on the frontend and **PHP 8 + MySQL** on the backend. No frameworks, no build tools, no TypeScript — just clean, readable code.

---

## Features

- **Product catalog** — 25 products across Laptops, Mobiles, Refrigerators, Washing Machines, and ACs
- **Search & filter** — search by name/brand, filter by category, sort by price
- **Product detail pages** — image, specs, ratings, discount badges, add to cart / wishlist
- **Shopping cart** — add, remove, change quantity, clear cart, order summary with GST & delivery
- **Wishlist** — save products for later, move to cart
- **User accounts** — register, login, logout, session-based authentication
- **Checkout** — delivery address form, order summary, place order
- **Order tracking** — view order history with status badges
- **Responsive design** — works on desktop and mobile
- **Dark theme** — modern UI with smooth hover effects

---

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | HTML5, CSS3, JavaScript (ES6+)      |
| Framework  | AngularJS 1.8 (vendored locally)    |
| Backend    | PHP 8.2                             |
| Database   | MySQL (via XAMPP)                   |
| Web Server | Apache (XAMPP)                      |

---

## Project Structure

```
my-online-shop-main/
├── frontend/                  # Static frontend (HTML/CSS/JS)
│   ├── index.html             # Home page (hero, categories, featured products)
│   ├── products.html          # Product listing (search, filter, sort)
│   ├── product.html           # Product detail page
│   ├── cart.html              # Shopping cart
│   ├── wishlist.html          # Wishlist
│   ├── checkout.html          # Checkout / place order
│   ├── orders.html            # Order history
│   ├── order-confirmation.html# Order success page
│   ├── login.html             # Login page
│   ├── register.html          # Registration page
│   ├── about.html             # About page
│   ├── contact.html           # Contact form
│   ├── favicon.svg            # Site icon
│   ├── css/
│   │   └── style.css          # All styles (dark theme, responsive)
│   ├── js/
│   │   ├── app.js             # AngularJS app (controllers, services, filters)
│   │   └── vendor/
│   │       └── angular.min.js # AngularJS 1.8 library
│   ├── partials/
│   │   ├── header.html        # Navigation bar (search, cart badge, auth)
│   │   ├── footer.html        # Footer with links
│   │   └── product-card.html  # Reusable product card component
│   └── images/
│       ├── new-arrivals.jpg   # Hero banner image
│       └── placeholder.svg    # Fallback image for broken links
│
├── backend/                   # PHP API server
│   ├── index.php              # API entry point (routes to api/)
│   ├── router.php             # API router
│   ├── api/
│   │   ├── products.php       # GET all products
│   │   ├── cart.php           # GET/POST/PUT/DELETE cart items
│   │   ├── wishlist.php       # GET/POST/DELETE wishlist items
│   │   ├── login.php          # POST login
│   │   ├── register.php       # POST register
│   │   ├── session.php        # GET/DELETE session (auth check)
│   │   ├── order.php          # POST place order
│   │   └── orders.php         # GET order history
│   ├── includes/
│   │   └── helpers.php        # Shared: DB, auth, CSRF, rate limiting
│   └── config/
│       ├── db.php             # Database connection (PDO)
│       └── catalog.json       # Product catalog (prices, images, specs)
│
├── SQL/
│   └── ecommerce.sql          # Database schema + sample data
│
├── router-dev.php             # Dev router for php -S (fallback)
├── start.bat                  # One-click start script (Windows)
└── README.md                  # This file
```

---

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Wishlist table
CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Orders table
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  address TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('confirmed','shipped','delivered') DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Rate limiting table
CREATE TABLE rate_limits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bucket VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

| Method | Endpoint           | Description                        | Auth |
| ------ | ------------------ | ---------------------------------- | ---- |
| GET    | `/api/products.php`  | Get all products                   | No   |
| GET    | `/api/cart.php`     | Get cart items                     | Yes  |
| POST   | `/api/cart.php`     | Add to cart                        | Yes  |
| PUT    | `/api/cart.php`     | Update cart item quantity          | Yes  |
| DELETE | `/api/cart.php`     | Remove from cart / clear cart      | Yes  |
| GET    | `/api/wishlist.php` | Get wishlist items                 | Yes  |
| POST   | `/api/wishlist.php` | Add to wishlist                    | Yes  |
| DELETE | `/api/wishlist.php` | Remove from wishlist               | Yes  |
| POST   | `/api/login.php`    | Login (email + password)           | No   |
| POST   | `/api/register.php` | Register new account               | No   |
| GET    | `/api/session.php`  | Check if logged in                 | Yes  |
| DELETE | `/api/session.php`  | Logout                             | Yes  |
| POST   | `/api/order.php`    | Place order                        | Yes  |
| GET    | `/api/orders.php`   | Get order history                  | Yes  |

---

## Setup Instructions

### Prerequisites

- [XAMPP](https://www.apachefriends.org/) (Apache + MySQL + PHP)
- A modern browser

### Step 1: Clone the repository

```bash
git clone https://github.com/N1nja-hunt3r/my-online-shop.git
cd my-online-shop
```

### Step 2: Set up the database

1. Open XAMPP Control Panel and start **Apache** and **MySQL**
2. Go to [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
3. Create a new database called `ecommerce`
4. Import `SQL/ecommerce.sql`

### Step 3: Configure the backend

1. Copy `backend/.env.example` to `backend/.env`
2. Update the database credentials in `.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ecommerce
DB_USER=root
DB_PASS=
ALLOWED_ORIGINS=http://localhost
```

### Step 4: Start the server

**Option A — Using the batch file (Windows):**

Double-click `start.bat`

**Option B — Using XAMPP Apache:**

The Apache vhost config should point `localhost` to the `frontend/` folder. Make sure `C:\xampp\apache\conf\extra\httpd-vhosts.conf` contains:

```apache
<VirtualHost *:80>
    DocumentRoot "C:/xampp/htdocs/my-online-shop/frontend"
    ServerName localhost
</VirtualHost>
```

**Option C — Using PHP built-in server (dev only):**

```bash
php -S localhost:8000 router-dev.php
```

### Step 5: Open the site

Go to [http://localhost](http://localhost) in your browser.

---

## How It Works

### Frontend (AngularJS)

- **Single `app.js` file** contains the entire AngularJS application
- **Services**: `Session` (auth state), `Products` (catalog data)
- **Controllers**: one per page (HomeCtrl, ProductsCtrl, ProductCtrl, CartCtrl, etc.)
- **Filters**: `rupee` (formats ₹ prices), `price` (calculates discounted price)
- **Directive**: `imgFallback` (shows placeholder when product image fails to load)
- **Partials**: reusable header, footer, and product-card templates

### Backend (PHP)

- **Single entry point**: all API requests go to `backend/api/*.php`
- **Shared helpers** (`includes/helpers.php`): database connection, session auth, CSRF protection, rate limiting, JSON responses
- **Session-based auth**: PHP sessions with `shopease_sid` cookie, `HttpOnly` + `SameSite=Lax`
- **CSRF protection**: all state-changing requests must send `X-Requested-With: fetch` header
- **Rate limiting**: brute-force protection on login (5 attempts per email+IP, 30 per IP, 15-minute window)
- **Password hashing**: `password_hash()` / `password_verify()` with `PASSWORD_DEFAULT`
- **Product catalog**: stored in `backend/config/catalog.json` (server-side, cannot be manipulated by users)

### Security Features

- Passwords hashed with bcrypt (via `password_hash`)
- CSRF guard on all state-changing API requests
- Rate limiting on login attempts
- `HttpOnly` session cookies (not accessible via JavaScript)
- `SameSite=Lax` cookie attribute
- `X-Content-Type-Options: nosniff` header
- `X-Frame-Options: DENY` header
- `Content-Security-Policy` header
- Server-side price catalog (users cannot modify prices)
- Session fixation protection (session ID regenerated on login)

---

## Pages

| Page                  | URL                    | Description                              |
| --------------------- | ---------------------- | ---------------------------------------- |
| Home                  | `/index.html`          | Hero banner, categories, featured items  |
| Products              | `/products.html`       | Full catalog with search/filter/sort     |
| Product Detail        | `/product.html?id=N`    | Single product with specs and actions    |
| Cart                  | `/cart.html`           | Cart items, quantities, order summary    |
| Wishlist              | `/wishlist.html`       | Saved products                           |
| Checkout              | `/checkout.html`       | Delivery address, place order            |
| Orders                | `/orders.html`         | Order history with status                |
| Order Confirmation    | `/order-confirmation.html?id=N` | Success page after ordering     |
| Login                 | `/login.html`          | Sign in                                  |
| Register              | `/register.html`       | Create account                           |
| About                 | `/about.html`          | About the store                          |
| Contact               | `/contact.html`        | Contact form                             |

---

## License

This is a college project. Free to use and modify for educational purposes.
