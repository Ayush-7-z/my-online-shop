<?php
require_once __DIR__ . '/../includes/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') errorResponse('Method not allowed', 405);

$data     = getJsonInput();
$name     = trim((string)($data['name'] ?? ''));
$email    = trim((string)($data['email'] ?? ''));
$password = (string)($data['password'] ?? '');
$phone    = trim((string)($data['phone'] ?? ''));

if ($name === '' || $email === '' || $password === '') errorResponse('Name, email, and password are required');
if (strlen($name) < 2 || strlen($name) > 100) errorResponse('Name must be 2-100 characters');
if (strlen($email) > 150 || !filter_var($email, FILTER_VALIDATE_EMAIL)) errorResponse('Invalid email address');
if (strlen($password) < 8 || strlen($password) > 72) errorResponse('Password must be 8-72 characters'); // 72 = bcrypt limit
if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/\d/', $password)) errorResponse('Password must contain a letter and a number');
if ($phone !== '' && !preg_match('/^[0-9+()\s-]{7,15}$/', $phone)) errorResponse('Invalid phone number');

$conn   = getConnection();
$bucket = hash('sha256', 'register|' . clientIp());
if (attemptCount($conn, $bucket, 3600) >= 10) tooManyRequests(3600);
recordAttempt($conn, $bucket);

try {
    $conn->prepare('INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)')
         ->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), $phone]);
} catch (PDOException $e) {
    if (($e->errorInfo[1] ?? 0) === 1062) errorResponse('Email already registered', 409); // UNIQUE(email)
    throw $e;
}

$id = (int)$conn->lastInsertId();
loginSession($id); // a new customer is signed in straight away
jsonResponse(['success' => true, 'message' => 'Account created successfully!', 'user' => ['id' => $id, 'name' => $name, 'email' => $email, 'phone' => $phone]]);
