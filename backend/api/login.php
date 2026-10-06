<?php
require_once __DIR__ . '/../includes/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') errorResponse('Method not allowed', 405);

$data     = getJsonInput();
$email    = trim((string)($data['email'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($email === '' || $password === '') errorResponse('Email and password are required');
if (strlen($email) > 150 || strlen($password) > 72) errorResponse('Invalid email or password', 401);

// Brute-force protection: 5 failures per email+IP, 30 per IP, within 15 minutes.
$conn   = getConnection();
$ip     = clientIp();
$limits = [hash('sha256', 'login|' . $ip . '|' . strtolower($email)) => 5, hash('sha256', 'login-ip|' . $ip) => 30];
foreach ($limits as $bucket => $max) {
    if (attemptCount($conn, $bucket, 900) >= $max) tooManyRequests(900);
}

$stmt = $conn->prepare('SELECT id, name, email, password, phone FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

// Hash a dummy password when the email is unknown so both failures take the same time.
$valid = password_verify($password, $user['password'] ?? password_hash('dummy-password', PASSWORD_DEFAULT));
if (!$user || !$valid) {
    foreach (array_keys($limits) as $bucket) recordAttempt($conn, $bucket);
    errorResponse('Invalid email or password', 401); // same message for unknown email and wrong password
}

clearAttempts($conn, array_key_first($limits));
if (password_needs_rehash($user['password'], PASSWORD_DEFAULT)) {
    $conn->prepare('UPDATE users SET password = ? WHERE id = ?')->execute([password_hash($password, PASSWORD_DEFAULT), $user['id']]);
}

loginSession((int)$user['id']);
unset($user['password']);
$user['id'] = (int)$user['id'];
jsonResponse(['success' => true, 'message' => 'Login successful!', 'user' => $user]);
