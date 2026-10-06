<?php
// Settings come from backend/.env (copy .env.example) or real environment variables.
// Defaults match a fresh XAMPP install: MySQL on 127.0.0.1:3306, user "root", empty password.
function env(string $key, string $default = ''): string {
    static $file = null;
    $file ??= is_file(__DIR__ . '/../.env') ? parse_ini_file(__DIR__ . '/../.env') : [];
    $value = getenv($key);
    return $value !== false ? $value : (string)($file[$key] ?? $default);
}

// MySQL connection (PDO). On first use the database and tables are created from SQL/ecommerce.sql.
function getConnection(): PDO {
    static $conn = null;
    if ($conn) return $conn;

    $name = env('DB_NAME', 'shopease');
    if (!preg_match('/^\w+$/', $name)) throw new RuntimeException('DB_NAME may only contain letters, digits and _');

    $dsn     = 'mysql:host=' . env('DB_HOST', '127.0.0.1') . ';port=' . env('DB_PORT', '3306') . ';charset=utf8mb4';
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false, // real prepared statements + native int types
    ];
    $connect = fn(string $extra = '') => new PDO($dsn . $extra, env('DB_USER', 'root'), env('DB_PASS'), $options);

    try {
        try {
            $conn = $connect(";dbname=$name");
        } catch (PDOException $e) {
            if (!str_contains($e->getMessage(), '[1049]')) throw $e; // 1049 = unknown database (first run)
            $connect()->exec("CREATE DATABASE `$name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $conn = $connect(";dbname=$name");
        }
        ensureSchema($conn);
    } catch (Throwable $e) {
        $conn = null;
        error_log('Database setup failed: ' . $e->getMessage());
        errorResponse(publicError('Database connection failed', $e), 503);
    }
    return $conn;
}

// Creates missing tables once (statements are idempotent). Refuses the old layout whose
// tables pointed at a products table, because cart/order inserts fail against it.
function ensureSchema(PDO $conn): void {
    if ($conn->query("SHOW TABLES LIKE 'rate_limits'")->fetchColumn()) return;

    $legacy = $conn->query("SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS
                            WHERE CONSTRAINT_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME = 'products'")->fetchColumn();
    if ($legacy) {
        throw new RuntimeException('Old database layout found. In phpMyAdmin drop this database, then reload the page - it is re-created automatically.');
    }

    $sql = preg_replace('/--.*$/m', '', file_get_contents(__DIR__ . '/../../SQL/ecommerce.sql'));
    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        $conn->exec($statement);
    }
}
