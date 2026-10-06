# ShopEase - Online Shop

React (Vite) frontend + vanilla PHP API + MySQL (XAMPP). Accounts, cart, wishlist and orders live in MySQL and are
tied to a server-side login session. The product catalog is `frontend/src/data/products.js`; the same data is exported
to `backend/config/catalog.json` so the server prices orders itself.

```
frontend/   React + Vite (:5173) - proxies /api to the PHP server
backend/    PHP API (:8000): api/*.php, includes/helpers.php, config/ (db.php, catalog.json), router.php
SQL/        ecommerce.sql - table definitions (applied automatically)
```

## Run it (Windows + XAMPP)

1. Open the **XAMPP Control Panel** and **Start MySQL**. (Apache is not needed.)
2. Make sure PHP is on your PATH: open a new terminal and run `php -v`. If it is not found, add `C:\xampp\php` to PATH.
   `php -m` should list `pdo_mysql`.
3. Start the project:
    ```bash
    cd frontend
    npm install
    npm run dev      # Vite on :5173 + PHP API on :8000
    ```
4. Open http://localhost:5173 and register.

The database `shopease` and its tables are created automatically on the first request (fresh XAMPP defaults:
user `root`, empty password). Browse the data at http://localhost/phpmyadmin (needs Apache running).

### If something goes wrong

The register/login form shows the real cause while you run `npm run dev` (for example "Database connection failed:
... Access denied"). Common ones:

| Message | Fix |
|---|---|
| `Connection refused` / `No connection could be made` | MySQL is not started in XAMPP |
| `Access denied for user 'root'` | You set a MySQL password: copy `backend/.env.example` to `backend/.env` and set `DB_PASS="..."` |
| `Old database layout found` | Your `shopease` database comes from the first version of this project. In phpMyAdmin drop it (only test data), reload the page |
| `could not find driver` | In `C:\xampp\php\php.ini` make sure `extension=pdo_mysql` has no leading `;`, then restart |

## Security

- Passwords: `password_hash` (bcrypt), 8-72 characters with a letter and a number, rehashed automatically when the algorithm improves.
- Sessions: HttpOnly + SameSite=Lax cookie, strict mode, new id on every login/registration, real server-side logout, `Secure` flag on HTTPS.
- Brute force: 5 failed logins per email+IP and 30 per IP per 15 minutes, 10 registrations per IP per hour (HTTP 429). Unknown email and wrong password give the same answer in the same time.
- CSRF: state-changing requests must carry `X-Requested-With: fetch`; cross-origin callers need a CORS preflight that only `ALLOWED_ORIGINS` pass.
- The browser never sends a user id or a price. Cart, wishlist and orders use the session user and prices/discounts/stock from `catalog.json`.
- Every query is a prepared statement; API responses are JSON-only with `nosniff`, `X-Frame-Options: DENY`, a locked-down CSP and `no-store`.
- Errors are logged server-side; clients get a generic message (details only on the local `php -S` dev server).

After editing `frontend/src/data/products.js`, run `npm run catalog` (it also runs automatically before `npm run dev`).
The old database password was committed to the repository earlier - change your MySQL root password if it was ever real.

## Production notes

- Serve `frontend/dist` and the PHP API from the same origin over HTTPS (for example nginx: static files + `/api/` to PHP-FPM),
  and create a dedicated MySQL user instead of `root`.
- Only `backend/api/*.php` should be web-reachable; keep `.env`, `config/`, `includes/` and `SQL/` out of the web root.
- If a reverse proxy terminates TLS, make sure PHP sees `HTTPS=on` so the session cookie gets the `Secure` flag.
