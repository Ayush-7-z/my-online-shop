<?php
// Single dev entry (php -S): static frontend files are served from /frontend,
// /api/*.php is dispatched to /backend/api. Run from the project root with:
//   php -S 127.0.0.1:8000 -t frontend router-dev.php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (preg_match('#^/api/[a-z_]+\.php$#', $uri)) {
    $file = __DIR__ . '/backend' . $uri;
    if (is_file($file)) { require $file; return true; }
}

return false; // static file from the docroot (frontend/), or PHP's own 404
