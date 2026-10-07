# ShopEase — Online Electronics Store

A full-stack e-commerce web application for an electronics store. Built with HTML, CSS, JavaScript, AngularJS 1.8 on the frontend and PHP 8 + MySQL on the backend. No frameworks, no build tools, no TypeScript — just clean, readable code.

## Features

- Product catalog — 25 products across Laptops, Mobiles, Refrigerators, Washing Machines, and ACs
- Search and filter — search by name/brand, filter by category, sort by price
- Product detail pages — image, specs, ratings, discount badges, add to cart / wishlist
- Shopping cart — add, remove, change quantity, clear cart, order summary with GST and delivery
- Wishlist — save products for later, move to cart
- User accounts — register, login, logout, session-based authentication
- Checkout — delivery address form, order summary, place order
- Order tracking — view order history with status badges
- Responsive design — works on desktop and mobile
- Dark theme — modern UI with smooth hover effects

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | HTML5, CSS3, JavaScript (ES6+)      |
| Framework  | AngularJS 1.8 (vendored locally)    |
| Backend    | PHP 8.2                             |
| Database   | MySQL (via XAMPP)                   |
| Web Server | Apache (XAMPP) or PHP built-in      |

## Libraries Used

| Library | Purpose |
|---------|---------|
| AngularJS 1.8 | Frontend MVC framework — controllers, services, filters, directives |
| PDO (PHP) | Database abstraction with prepared statements |
| password_hash / password_verify | bcrypt password hashing |
| json_encode / json_decode | API request/response handling |
| PHP sessions | Server-side authentication state |
| filter_var | Email validation |
| preg_match | Input validation (phone, password strength) |
| hash('sha256') | Rate-limit bucket keys |
| random_int | Cryptographically secure random for rate-limit cleanup |

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
│   ├── index.php              # API entry point
│   ├── router.php             # API router (php -S)
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
│       ├── catalog.json       # Product catalog (prices, images, specs)
│       └── .env.example       # Environment template
│
├── SQL/
│   └── ecommerce.sql          # Database schema
│
├── router-dev.php             # Dev router for php -S (fallback)
├── start.bat                  # One-click start script (Windows)
└── README.md                  # This file
```

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| name | VARCHAR(100) | |
| email | VARCHAR(150) UNIQUE | |
| password | VARCHAR(255) | bcrypt hash |
| phone | VARCHAR(20) | optional |
| address | TEXT | |
| created_at | TIMESTAMP | |

### orders
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| user_id | INT FK -> users(id) | ON DELETE CASCADE |
| total_amount | DECIMAL(10,2) | |
| gst | DECIMAL(10,2) | 18% |
| delivery_charge | DECIMAL(10,2) | 0 if subtotal >= 500, else 49 |
| status | ENUM | pending/confirmed/shipped/delivered/cancelled |
| coupon_code | VARCHAR(50) | |
| discount_amount | DECIMAL(10,2) | |
| address | TEXT | |
| created_at | TIMESTAMP | |

### order_items
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| order_id | INT FK -> orders(id) | ON DELETE CASCADE |
| product_id | INT | references catalog.json |
| quantity | INT | |
| price | DECIMAL(10,2) | unit price paid |

### cart
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| user_id | INT FK -> users(id) | ON DELETE CASCADE |
| product_id | INT | |
| quantity | INT | default 1 |
| added_at | TIMESTAMP | |
| | | UNIQUE(user_id, product_id) |

### wishlist
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| user_id | INT FK -> users(id) | ON DELETE CASCADE |
| product_id | INT | |
| added_at | TIMESTAMP | |
| | | UNIQUE(user_id, product_id) |

### rate_limits
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| bucket | CHAR(64) | sha256 of action|ip|email |
| created_at | TIMESTAMP | |
| | | INDEX(bucket, created_at) |

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/products.php | Get all products | No |
| GET | /api/cart.php | Get cart items | Yes |
| POST | /api/cart.php | Add to cart | Yes |
| PUT | /api/cart.php | Update cart item quantity | Yes |
| DELETE | /api/cart.php | Remove from cart / clear cart | Yes |
| GET | /api/wishlist.php | Get wishlist items | Yes |
| POST | /api/wishlist.php | Add to wishlist | Yes |
| DELETE | /api/wishlist.php | Remove from wishlist | Yes |
| POST | /api/login.php | Login (email + password) | No |
| POST | /api/register.php | Register new account | No |
| GET | /api/session.php | Check if logged in | Yes |
| DELETE | /api/session.php | Logout | Yes |
| POST | /api/order.php | Place order | Yes |
| GET | /api/orders.php | Get order history | Yes |

## Setup Instructions

### Prerequisites

- XAMPP (Apache + MySQL + PHP) or PHP 8.2+ with MySQL
- A modern browser

### Quick Start (Windows)

1. Clone the repository
2. Start Apache and MySQL from XAMPP Control Panel
3. Double-click `start.bat`
4. Open http://localhost:8000 in your browser

### Manual Setup

1. Clone the repository
2. Start Apache and MySQL (XAMPP) or use `php -S`
3. The database and tables are created automatically on first API request
4. If manual setup needed: import `SQL/ecommerce.sql` into a database named `shopease`
5. Copy `backend/.env.example` to `backend/.env` and update credentials
6. Start the server:
   - Option A: `start.bat` (Windows)
   - Option B: `php -S localhost:8000 -t frontend router-dev.php`
   - Option C: Configure Apache vhost to point to `frontend/`
7. Open http://localhost:8000 (or http://localhost for XAMPP Apache)

## How the Code Works

### Frontend Architecture (AngularJS)

The entire frontend lives in a single `frontend/js/app.js` file organized as an AngularJS module called `shopease`.

**Module configuration:**
- Sets `X-Requested-With: fetch` header on all HTTP requests (required by backend CSRF guard)

**Services (factories):**
- `Session` — wraps `/api/session.php`. Caches the logged-in user. Provides `get()`, `set(u)`, `logout()`.
- `Products` — fetches `/api/products.php` once, returns the product array as a promise.

**Filters:**
- `rupee` — formats a number as Indian Rupees (e.g. `64990` becomes `₹64,990`)
- `price` — calculates discounted price: `price - (price * discount / 100)`

**Directive:**
- `imgFallback` — on image error, swaps `src` to `/images/placeholder.svg`

**Controllers (one per page):**

| Controller | Page | What it does |
|------------|------|--------------|
| HeaderCtrl | All pages | Loads user info, cart count, wishlist count. Handles logout and search. |
| HomeCtrl | index.html | Loads products, extracts categories, shows featured (first 8). Add to cart. |
| ProductsCtrl | products.html | Search by name/brand, filter by category, sort by price low/high. Add to cart. |
| ProductCtrl | product.html | Finds product by `?id=` param. Add to cart, add to wishlist. |
| CartCtrl | cart.html | Load cart, change quantity (PUT), remove item (DELETE), clear cart. Shows subtotal. |
| WishlistCtrl | wishlist.html | Load wishlist, remove item, move to cart. |
| LoginCtrl | login.html | POST email + password. On success, cache user and redirect home. |
| RegisterCtrl | register.html | POST name, email, phone, password. Auto-login on success. |
| CheckoutCtrl | checkout.html | Load cart, compute subtotal + 18% GST + delivery (free above 500). Place order. |
| OrdersCtrl | orders.html | Fetch all orders for logged-in user. |
| OrderCtrl | order-confirmation.html | Find specific order by `?id=` param. |

**Partials (reusable templates):**
- `header.html` — navigation bar with logo, search box, cart/wishlist badges, login/logout
- `footer.html` — site links and copyright
- `product-card.html` — product image, name, price, discount badge, rating, add-to-cart button

### Backend Architecture (PHP)

**Entry points:**
- `router-dev.php` — used with `php -S`. Routes `/api/*.php` to `backend/api/`, serves static files from `frontend/`.
- `backend/router.php` — alternative router for `php -S` with docroot at `backend/`.

**Shared bootstrap (`backend/includes/helpers.php`):**
Every API file starts by requiring this file. It handles:
1. Security headers (CORS, X-Frame-Options, CSP, nosniff, Referrer-Policy, no-store)
2. JSON response helpers (`jsonResponse`, `errorResponse`, `tooManyRequests`)
3. Global exception handler — converts uncaught errors to JSON 500
4. CSRF guard — rejects state-changing requests without `X-Requested-With: fetch` header
5. Session management — `startSession()`, `loginSession($userId)`, `requireUser()`
6. Rate limiting — `clientIp()`, `attemptCount()`, `recordAttempt()`, `clearAttempts()`
7. Product catalog — `catalog()`, `catalogProduct($id)`, `unitPrice($product)`

**Database layer (`backend/config/db.php`):**
- `env($key, $default)` — reads from `backend/.env` file or real environment variables
- `getConnection()` — creates PDO connection with `ERRMODE_EXCEPTION`, `FETCH_ASSOC`, real prepared statements
- On first run: creates the `shopease` database if it doesn't exist, then runs `ensureSchema()`
- `ensureSchema()` — executes `SQL/ecommerce.sql` statements (idempotent with IF NOT EXISTS)
- Refuses to run against a legacy database layout (checks for old foreign keys)

**API endpoints:**

| File | Method | What it does |
|------|--------|--------------|
| products.php | GET | Returns all products from `catalog.json` |
| cart.php | GET | Returns cart items joined with catalog data (name, price, stock) |
| cart.php | POST | Adds item to cart. Uses `ON DUPLICATE KEY UPDATE` with `LEAST(quantity + ?, stock)` to cap at stock. |
| cart.php | PUT | Sets quantity (capped at stock) |
| cart.php | DELETE | Removes one item or clears entire cart |
| wishlist.php | GET | Returns wishlist items from catalog |
| wishlist.php | POST | Adds to wishlist (`INSERT IGNORE` for idempotency) |
| wishlist.php | DELETE | Removes from wishlist |
| login.php | POST | Validates email + password. Rate limited: 5 per email+IP, 30 per IP, 15-min window. Uses dummy hash for unknown emails (timing attack prevention). Rehashes if needed. |
| register.php | POST | Validates input (name 2-100 chars, valid email, password 8-72 chars with letter+digit, phone format). Rate limited: 10 per IP per hour. Auto-login on success. |
| session.php | GET | Returns current user from session |
| session.php | DELETE | Destroys session and expires cookie |
| order.php | POST | Validates address. Computes subtotal from server catalog (never trusts browser prices). Applies 18% GST, delivery (free above 500). Inserts order + order_items in a transaction. Clears cart. |
| orders.php | GET | Returns all orders for user with items joined from catalog |

### Security Features

- Passwords hashed with bcrypt via `password_hash()` / `password_verify()`
- CSRF guard: all state-changing requests must send `X-Requested-With: fetch` header (cannot be sent cross-origin without CORS preflight)
- Rate limiting on login (5 per email+IP, 30 per IP, 15 min) and registration (10 per IP per hour)
- `HttpOnly` session cookies (not accessible via JavaScript)
- `SameSite=Lax` cookie attribute
- `X-Content-Type-Options: nosniff` header
- `X-Frame-Options: DENY` header
- `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'` header
- Server-side price catalog in `catalog.json` (users cannot modify prices)
- Session fixation protection (session ID regenerated on login via `session_regenerate_id`)
- `display_errors` off in production (errors logged, not shown)
- DB_NAME validated with regex to prevent injection in DSN
- All SQL uses prepared statements with parameter binding

### Order Flow

```
User adds items to cart (POST /api/cart.php)
       │
       ▼
User goes to checkout (checkout.html)
       │
       ▼
Frontend loads cart, computes display prices (subtotal, GST, delivery)
       │
       ▼
User enters address, clicks "Place Order" (POST /api/order.php)
       │
       ▼
Backend recomputes everything from server catalog:
  - Validates each product exists and is in stock
  - Caps quantity at available stock
  - Computes unit price from catalog (ignores browser prices)
  - Calculates subtotal, 18% GST, delivery charge
       │
       ▼
Database transaction:
  1. INSERT INTO orders (status = 'confirmed')
  2. INSERT INTO order_items for each item
  3. DELETE FROM cart (clear user's cart)
  4. COMMIT
       │
       ▼
Returns order details → frontend redirects to order-confirmation.html
```

### Cart Quantity Capping

When adding to cart, the SQL uses:
```sql
INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE quantity = LEAST(quantity + CAST(? AS SIGNED), CAST(? AS SIGNED))
```
This ensures the cart quantity never exceeds the product's stock level, even if the user tries to add more.

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | /index.html | Hero banner, categories, featured items |
| Products | /products.html | Full catalog with search/filter/sort |
| Product Detail | /product.html?id=N | Single product with specs and actions |
| Cart | /cart.html | Cart items, quantities, order summary |
| Wishlist | /wishlist.html | Saved products |
| Checkout | /checkout.html | Delivery address, place order |
| Orders | /orders.html | Order history with status |
| Order Confirmation | /order-confirmation.html?id=N | Success page after ordering |
| Login | /login.html | Sign in |
| Register | /register.html | Create account |
| About | /about.html | About the store |
| Contact | /contact.html | Contact form |

## Environment Configuration

Copy `backend/.env.example` to `backend/.env`:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=shopease
DB_USER=root
DB_PASS=
ALLOWED_ORIGINS=http://localhost:5173
```

All values are optional — defaults match a fresh XAMPP install.

## License

This is a college project. Free to use and modify for educational purposes.
