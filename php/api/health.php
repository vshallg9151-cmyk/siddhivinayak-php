<?php
/**
 * ============================================================================
 * Project: Siddhivinayak Tours & Travels
 * File: php/api/health.php
 * Purpose: Live Health Check & Diagnostics API (PHP + MySQL)
 * Method: GET
 * ============================================================================
 */

require_once __DIR__ . '/../config/database.php';

// 1. Validate HTTP Request Method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(405, [
        'success' => false,
        'message' => 'Method Not Allowed. Only GET requests are accepted.'
    ]);
}

try {
    // 2. Check Database Connectivity
    $pdo = getDatabaseConnection();
    
    // Execute a simple query to verify active MySQL session
    $stmt = $pdo->query('SELECT DATABASE() AS current_db, VERSION() AS mysql_version');
    $info = $stmt->fetch();

    // 3. Return Successful Health Status
    sendJsonResponse(200, [
        'success'    => true,
        'project'    => 'Siddhivinayak Tours and Travels',
        'technology' => 'PHP + MySQL',
        'php'        => 'running',
        'database'   => 'connected',
        'details'    => [
            'database_name' => $info['current_db'] ?? 'siddhivinayak_db',
            'php_version'   => PHP_VERSION,
            'mysql_version' => $info['mysql_version'] ?? 'unknown',
            'server_time'   => date('Y-m-d H:i:s')
        ]
    ]);
} catch (Exception $e) {
    sendJsonResponse(500, [
        'success'    => false,
        'project'    => 'Siddhivinayak Tours and Travels',
        'technology' => 'PHP + MySQL',
        'php'        => 'running',
        'database'   => 'disconnected',
        'error'      => $e->getMessage()
    ]);
}
