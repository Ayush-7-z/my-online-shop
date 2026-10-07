<?php
require_once __DIR__ . '/../includes/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') errorResponse('Method not allowed', 405);

jsonResponse(['success' => true, 'products' => array_values(catalog())]);
