<?php
/**
 * ============================================================================
 * Project: Siddhivinayak Tours & Travels
 * File: php/api/login.php
 * Purpose: User Authentication Endpoint
 * Method: POST
 * ============================================================================
 */

require_once __DIR__ . '/../config/database.php';

// 1. Verify Request Method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(405, [
        'success' => false,
        'message' => 'Method Not Allowed. Only POST requests are accepted.'
    ]);
}

// 2. Extract and Sanitize Inputs
$data = getRequestData();

$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

// 3. Field Validations
if (empty($email) || empty($password)) {
    sendJsonResponse(400, [
        'success' => false,
        'message' => 'Email and password are required.'
    ]);
}

// 4. Database Operations
try {
    $pdo = getDatabaseConnection();

    // Query user by email using prepared statement
    $stmt = $pdo->prepare('SELECT id, name, email, phone, password, created_at FROM users WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    // Verify user existence and password hash
    if (!$user || !password_verify($password, $user['password'])) {
        sendJsonResponse(401, [
            'success' => false,
            'message' => 'Invalid email or password.'
        ]);
    }

    // Success response without exposing password hash
    sendJsonResponse(200, [
        'success' => true,
        'message' => 'Login successful. Welcome back, ' . $user['name'] . '!',
        'user'    => [
            'id'         => (int)$user['id'],
            'name'       => $user['name'],
            'email'      => $user['email'],
            'phone'      => $user['phone'],
            'created_at' => $user['created_at']
        ]
    ]);
} catch (PDOException $e) {
    sendJsonResponse(500, [
        'success' => false,
        'message' => 'Login failed: ' . $e->getMessage()
    ]);
}
