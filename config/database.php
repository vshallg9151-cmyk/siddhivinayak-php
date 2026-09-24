<?php
/**
 * Database Configuration & PDO Connection Handler
 * Siddhivinayak Tours & Travels - PHP + MySQL Architecture
 * 
 * Default XAMPP Configuration:
 * - Host: localhost
 * - Port: 3306
 * - Database: siddhivinayak_tours
 * - Username: root
 * - Password: '' (empty string)
 */

class Database {
    private static $host = 'localhost';
    private static $port = 3306;
    private static $db_name = 'siddhivinayak_tours';
    private static $username = 'root';
    private static $password = '';
    private static $charset = 'utf8mb4';
    private static $conn = null;

    /**
     * Get Authoritative PDO Database Connection
     * 
     * @return PDO|null
     */
    public static function getConnection() {
        if (self::$conn !== null) {
            return self::$conn;
        }

        // Allow overriding via environment variables if set in server or Apache virtual host
        $host = getenv('DB_HOST') ?: self::$host;
        $port = getenv('DB_PORT') ?: self::$port;
        $db   = getenv('DB_NAME') ?: self::$db_name;
        $user = getenv('DB_USER') ?: self::$username;
        $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : self::$password;
        $charset = self::$charset;

        $dsn = "mysql:host={$host};port={$port};dbname={$db};charset={$charset}";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$charset} COLLATE utf8mb4_unicode_ci"
        ];

        try {
            self::$conn = new PDO($dsn, $user, $pass, $options);
            return self::$conn;
        } catch (PDOException $e) {
            // Return JSON error response if connection fails
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => false,
                'message' => 'Database connection error. Please ensure MySQL is running in XAMPP and the `siddhivinayak_tours` database is imported.',
                'error'   => $e->getMessage()
            ]);
            exit;
        }
    }
}
