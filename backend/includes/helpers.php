<?php
// Shared bootstrap for every endpoint: security headers, JSON/CORS, CSRF guard,
// error handling, session auth, rate limiting and the server-side product catalog.
require_once __DIR__ . '/../config/db.php';

ini_set('display_errors', '0');

// ---- headers ---------------------------------------------------------------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, array_map('trim', explode(',', env('ALLOWED_ORIGINS', 'http://localhost:5173'))), true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
header('Cache-Control: no-store');

// ---- responses & errors ----------------------------------------------------
function getJsonInput(): array {
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

function jsonResponse($data) {
    echo json_encode($data);
    exit;
}

function errorResponse($msg, $code = 400) {
    http_response_code($code);
    jsonResponse(['error' => $msg]);
}

function tooManyRequests(int $seconds) {
    header("Retry-After: $seconds");
    errorResponse('Too many attempts. Please try again in ' . ceil($seconds / 60) . ' minutes.', 429);
}

// On the local dev server (php -S) show the real cause; anywhere else keep it generic.
function publicError(string $generic, Throwable $e): string {
    return PHP_SAPI === 'cli-server' ? "$generic: " . $e->getMessage() : $generic;
}

// Any uncaught failure (DB error, bad input type...) becomes JSON instead of an HTML/blank 500.
set_exception_handler(function (Throwable $e) {
    error_log((string)$e);
    errorResponse(publicError('Server error', $e), 500);
});

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// CSRF guard: a custom header cannot be sent cross-site without a CORS preflight, which only
// ALLOWED_ORIGINS pass. Together with the SameSite cookie this blocks forged requests.
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true) && ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'fetch') {
    errorResponse('Invalid request', 403);
}

// ---- session auth ----------------------------------------------------------
function startSession(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $week = 7 * 24 * 3600;
    ini_set('session.use_strict_mode', '1');   // never accept a session id the server did not create
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', (string)$week);
    session_name('shopease_sid');
    session_set_cookie_params(['lifetime' => $week, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS'])]);
    session_start();
}

// Marks the session as logged in (new id on every login/registration prevents session fixation).
function loginSession(int $userId): void {
    startSession();
    $_SESSION['uid'] = $userId;
}

// The logged-in user's id comes from the server session, never from the request body.
function requireUser(): int {
    startSession();
    return $_SESSION['uid'] ?? errorResponse('Please log in', 401);
}

// ---- rate limiting ---------------------------------------------------------
// Do not trust X-Forwarded-For: it is client-controlled unless a trusted proxy sets it.
function clientIp(): string {
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function attemptCount(PDO $conn, string $bucket, int $windowSeconds): int {
    $stmt = $conn->prepare('SELECT COUNT(*) FROM rate_limits WHERE bucket = ? AND created_at > (NOW() - INTERVAL ' . (int)$windowSeconds . ' SECOND)');
    $stmt->execute([$bucket]);
    return (int)$stmt->fetchColumn();
}

function recordAttempt(PDO $conn, string $bucket): void {
    $conn->prepare('INSERT INTO rate_limits (bucket) VALUES (?)')->execute([$bucket]);
    if (random_int(1, 50) === 1) $conn->exec('DELETE FROM rate_limits WHERE created_at < (NOW() - INTERVAL 1 DAY)');
}

function clearAttempts(PDO $conn, string $bucket): void {
    $conn->prepare('DELETE FROM rate_limits WHERE bucket = ?')->execute([$bucket]);
}

// ---- product catalog -------------------------------------------------------
// Prices, discounts and stock come from here (generated from frontend/src/data/products.js by
// `npm run catalog`), never from the browser, so a customer cannot change what they pay.
function catalog(): array {
    static $products = null;
    if ($products === null) {
        $file = __DIR__ . '/../config/catalog.json';
        if (!is_file($file)) throw new RuntimeException('backend/config/catalog.json is missing - run "npm run catalog" in frontend/');
        $products = json_decode(file_get_contents($file), true) ?: [];
    }
    return $products;
}

function catalogProduct(int $id): array {
    return catalog()[$id] ?? errorResponse('Unknown product', 404);
}

function unitPrice(array $product): float {
    return $product['price'] - $product['price'] * $product['discount'] / 100;
}
