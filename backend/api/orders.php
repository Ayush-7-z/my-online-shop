<?php
require_once __DIR__ . '/../includes/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') errorResponse('Method not allowed', 405);

$userId = requireUser();
$conn   = getConnection();

$stmt = $conn->prepare('SELECT id, total_amount, gst, delivery_charge, status, address, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC');
$stmt->execute([$userId]);
$orders = $stmt->fetchAll();

$itemsStmt = $conn->prepare('SELECT product_id, quantity, price FROM order_items WHERE order_id = ?');
foreach ($orders as &$order) {
    foreach (['total_amount', 'gst', 'delivery_charge'] as $col) $order[$col] = (float)$order[$col];

    $itemsStmt->execute([$order['id']]);
    $order['items'] = [];
    foreach ($itemsStmt->fetchAll() as $row) {
        $product = catalog()[$row['product_id']] ?? ['id' => (int)$row['product_id'], 'name' => 'Product #' . $row['product_id']];
        $order['items'][] = array_merge($product, ['product_id' => (int)$row['product_id'], 'quantity' => (int)$row['quantity'], 'price' => (float)$row['price']]); // paid price wins
    }
}
unset($order);

jsonResponse(['success' => true, 'orders' => $orders]);
