<?php
/**
 * ============================================================================
 * Project: Siddhivinayak Tours & Travels
 * File: php/api/register.php
 * Purpose: User Registration Endpoint
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

$name     = trim($data['name'] ?? '');
$email    = trim($data['email'] ?? '');
$phone    = trim($data['phone'] ?? '');
$password = $data['password'] ?? '';

// 3. Field Validations
if (empty($name) || empty($email) || empty($phone) || empty($password)) {
    sendJsonResponse(400, [
        'success' => false,
        'message' => 'Validation error: name, email, phone, and password are all required.'
    ]);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJsonResponse(400, [
        'success' => false,
        'message' => 'Invalid email address format.'
    ]);
}

if (strlen($password) < 6) {
    sendJsonResponse(400, [
        'success' => false,
        'message' => 'Password must be at least 6 characters long.'
    ]);
}

// 4. Database Operations
try {
    $pdo = getDatabaseConnection();

    // Check if email is already registered
    $checkStmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $checkStmt->execute([':email' => $email]);

    if ($checkStmt->fetch()) {
        sendJsonResponse(409, [
            'success' => false,
            'message' => 'A user with this email address already exists.'
        ]);
    }

    // Securely hash the password using native BCRYPT
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Insert user record with prepared statement
    $insertStmt = $pdo->prepare(
        'INSERT INTO users (name, email, phone, password, created_at) 
         VALUES (:name, :email, :phone, :password, NOW())'
    );

    $insertStmt->execute([
        ':name'     => $name,
        ':email'    => $email,
        ':phone'    => $phone,
        ':password' => $hashedPassword
    ]);

    $newUserId = (int)$pdo->lastInsertId();

    sendJsonResponse(201, [
        'success' => true,
        'message' => 'User registered successfully.',
        'user'    => [
            'id'    => $newUserId,
            'name'  => $name,
            'email' => $email,
            'phone' => $phone
        ]
    ]);
} catch (PDOException $e) {
    sendJsonResponse(500, [
        'success' => false,
        'message' => 'Registration failed: ' . $e->getMessage()
    ]);
}
