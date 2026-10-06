<?php
// Dev-server router (php -S). Only "/" and /api/*.php are reachable, so .env, config/ and SQL/ are never served.
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($uri === '/') { require __DIR__ . '/index.php'; return true; }
if (preg_match('#^/api/[a-z_]+\.php$#', $uri) && is_file(__DIR__ . $uri)) { require __DIR__ . $uri; return true; }

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'Not found']);
return true;
