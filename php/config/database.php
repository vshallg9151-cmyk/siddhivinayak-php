<?php
/**
 * ============================================================================
 * Project: Siddhivinayak Tours & Travels
 * File: php/config/database.php
 * Purpose: Central Database Configuration & Helper Utilities
 * Engine: PHP 8+ with MySQL PDO (PHP Data Objects)
 * ============================================================================
 */

// Enable CORS (Cross-Origin Resource Sharing) for frontend & Postman integration
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Respond immediately to preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Establish and return a persistent PDO connection to MySQL.
 *
 * @return PDO
 */
function getDatabaseConnection() {
    // Database credentials for default XAMPP setup
    $host     = 'localhost';
    $dbName   = 'siddhivinayak_db';
    $username = 'root';
    $password = ''; // Default XAMPP MySQL password is empty
    $charset  = 'utf8mb4';

    $dsn = "mysql:host={$host};dbname={$dbName};charset={$charset}";

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        return new PDO($dsn, $username, $password, $options);
    } catch (PDOException $e) {
        sendJsonResponse(500, [
            'success' => false,
            'message' => 'Database connection failed: ' . $e->getMessage()
        ]);
        exit;
    }
}

/**
 * Helper to safely extract incoming request payload.
 * Supports both JSON body (fetch/axios) and standard form-data ($_POST).
 *
 * @return array
 */
function getRequestData() {
    $rawInput = file_get_contents('php://input');
    $jsonData = json_decode($rawInput, true);

    if (is_array($jsonData)) {
        return $jsonData;
    }

    return $_POST;
}

/**
 * Standardized JSON response helper.
 *
 * @param int $statusCode HTTP status code (200, 400, 404, 500, etc.)
 * @param array $data Response payload
 */
function sendJsonResponse($statusCode, array $data) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}
