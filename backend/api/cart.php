<?php
require_once __DIR__ . '/../includes/helpers.php';

$userId = requireUser();
$conn   = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

$data      = $method === 'GET' ? [] : getJsonInput();
$productId = (int)($data['product_id'] ?? 0);
$quantity  = (int)($data['quantity'] ?? 1);

// GET /api/cart.php — cart items, with name/price/stock taken from the server catalog
if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT product_id, quantity FROM cart WHERE user_id = ?');
    $stmt->execute([$userId]);

    $items = [];
    foreach ($stmt->fetchAll() as $row) {
        $product = catalog()[$row['product_id']] ?? null;
        if ($product) $items[] = $product + ['qty' => (int)$row['quantity']];
    }
    jsonResponse(['success' => true, 'cart' => $items]);
}

// POST /api/cart.php — add item (adds to quantity if already in cart, capped at stock)
if ($method === 'POST') {
    $product = catalogProduct($productId);
    if ($quantity < 1) errorResponse('Quantity must be at least 1');
    if ($product['stock'] < 1) errorResponse('Out of stock', 409);

    $conn->prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE quantity = LEAST(quantity + CAST(? AS SIGNED), CAST(? AS SIGNED))')
         ->execute([$userId, $productId, min($quantity, $product['stock']), $quantity, $product['stock']]);
    jsonResponse(['success' => true, 'message' => 'Added to cart!']);
}

// PUT /api/cart.php — set quantity (capped at stock)
if ($method === 'PUT') {
    $product = catalogProduct($productId);
    if ($quantity < 1) errorResponse('Quantity must be at least 1');

    $conn->prepare('UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?')
         ->execute([min($quantity, $product['stock']), $userId, $productId]);
    jsonResponse(['success' => true, 'message' => 'Cart updated!']);
}

// DELETE /api/cart.php — remove one item, or the whole cart when no product_id is sent
if ($method === 'DELETE') {
    $conn->prepare('DELETE FROM cart WHERE user_id = ?' . ($productId ? ' AND product_id = ?' : ''))
         ->execute($productId ? [$userId, $productId] : [$userId]);
    jsonResponse(['success' => true, 'message' => 'Removed from cart!']);
}

errorResponse('Method not allowed', 405);
