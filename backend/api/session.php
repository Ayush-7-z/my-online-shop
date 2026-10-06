<?php
// GET = who is logged in (validates the cookie session), DELETE = log out.
require_once __DIR__ . '/../includes/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = getConnection()->prepare('SELECT id, name, email, phone FROM users WHERE id = ?');
    $stmt->execute([requireUser()]);
    $user = $stmt->fetch();
    if (!$user) { session_destroy(); errorResponse('Please log in', 401); }
    $user['id'] = (int)$user['id'];
    jsonResponse(['success' => true, 'user' => $user]);
}

if ($method === 'DELETE') {
    startSession();
    $_SESSION = [];
    $cookie = session_get_cookie_params();
    setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => $cookie['path'], 'httponly' => true, 'samesite' => 'Lax']);
    session_destroy();
    jsonResponse(['success' => true]);
}

errorResponse('Method not allowed', 405);
