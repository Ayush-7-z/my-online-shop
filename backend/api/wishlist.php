<?php
require_once __DIR__ . '/../includes/helpers.php';

$userId = requireUser();
$conn   = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

$productId = (int)(($method === 'GET' ? [] : getJsonInput())['product_id'] ?? 0);

// GET /api/wishlist.php — wishlist items from the server catalog
if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT product_id FROM wishlist WHERE user_id = ?');
    $stmt->execute([$userId]);

    $items = [];
    foreach ($stmt->fetchAll() as $row) {
        $product = catalog()[$row['product_id']] ?? null;
        if ($product) $items[] = $product;
    }
    jsonResponse(['success' => true, 'wishlist' => $items]);
}

// POST /api/wishlist.php — add item (idempotent; the client decides add vs. remove)
if ($method === 'POST') {
    catalogProduct($productId);
    $conn->prepare('INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)')->execute([$userId, $productId]);
    jsonResponse(['success' => true, 'message' => 'Added to wishlist!']);
}

// DELETE /api/wishlist.php — remove item
if ($method === 'DELETE') {
    if (!$productId) errorResponse('Product ID required');
    $conn->prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?')->execute([$userId, $productId]);
    jsonResponse(['success' => true, 'message' => 'Removed from wishlist!']);
}

errorResponse('Method not allowed', 405);
