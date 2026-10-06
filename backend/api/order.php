<?php
require_once __DIR__ . '/../includes/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') errorResponse('Method not allowed', 405);

$userId  = requireUser();
$address = trim((string)(getJsonInput()['address'] ?? ''));
if ($address === '') errorResponse('Delivery address required');
if (strlen($address) > 500) errorResponse('Address is too long');

$conn = getConnection();

$stmt = $conn->prepare('SELECT product_id, quantity FROM cart WHERE user_id = ?');
$stmt->execute([$userId]);
$cartRows = $stmt->fetchAll();
if (!$cartRows) errorResponse('Cart is empty');

// Everything that costs money is computed here from the server catalog, not from the browser.
$subtotal = 0;
$items    = [];
foreach ($cartRows as $row) {
    $product = catalog()[$row['product_id']] ?? errorResponse('A product in your cart is no longer available', 409);
    if ($product['stock'] < 1) errorResponse($product['name'] . ' is out of stock', 409);

    $quantity  = min((int)$row['quantity'], $product['stock']);
    $unit      = round(unitPrice($product), 2);
    $subtotal += $unit * $quantity;
    $items[]   = ['product' => $product, 'quantity' => $quantity, 'price' => $unit];
}

$gst            = round($subtotal * 0.18, 2);
$deliveryCharge = $subtotal >= 500 ? 0 : 49;
$totalAmount    = round($subtotal + $gst + $deliveryCharge, 2);

$conn->beginTransaction();
try {
    $conn->prepare("INSERT INTO orders (user_id, total_amount, gst, delivery_charge, status, address) VALUES (?, ?, ?, ?, 'confirmed', ?)")
         ->execute([$userId, $totalAmount, $gst, $deliveryCharge, $address]);
    $orderId = (int)$conn->lastInsertId();

    $itemStmt = $conn->prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
    foreach ($items as $item) {
        $itemStmt->execute([$orderId, $item['product']['id'], $item['quantity'], $item['price']]);
    }

    $conn->prepare('DELETE FROM cart WHERE user_id = ?')->execute([$userId]);
    $conn->commit();
} catch (Throwable $e) {
    $conn->rollBack();
    throw $e; // handled by the global JSON error handler
}

jsonResponse([
    'success' => true,
    'message' => 'Order placed successfully!',
    'order'   => [
        'id' => $orderId, 'total_amount' => $totalAmount, 'gst' => $gst, 'delivery_charge' => $deliveryCharge,
        'subtotal' => round($subtotal, 2), 'status' => 'confirmed', 'address' => $address,
        'items' => array_map(fn($i) => array_merge($i['product'], ['product_id' => $i['product']['id'], 'quantity' => $i['quantity'], 'price' => $i['price']]), $items),
    ],
]);
