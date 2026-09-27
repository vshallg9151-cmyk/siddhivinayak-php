<?php
/**
 * ============================================================================
 * Project: Siddhivinayak Tours & Travels
 * File: php/api/contact.php
 * Purpose: Contact & Enquiry Form Submission Endpoint
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

$name    = trim($data['name'] ?? '');
$email   = trim($data['email'] ?? '');
$message = trim($data['message'] ?? '');

// 3. Field Validations
if (empty($name) || empty($email) || empty($message)) {
    sendJsonResponse(400, [
        'success' => false,
        'message' => 'Validation error: name, email, and message are all required.'
    ]);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJsonResponse(400, [
        'success' => false,
        'message' => 'Invalid email address format.'
    ]);
}

if (strlen($message) < 5) {
    sendJsonResponse(400, [
        'success' => false,
        'message' => 'Message must be at least 5 characters long.'
    ]);
}

// 4. Database Operations
try {
    $pdo = getDatabaseConnection();

    // Insert message into contact_messages using prepared statement
    $stmt = $pdo->prepare(
        'INSERT INTO contact_messages (name, email, message, created_at)
         VALUES (:name, :email, :message, NOW())'
    );

    $stmt->execute([
        ':name'    => $name,
        ':email'   => $email,
        ':message' => $message
    ]);

    $messageId = (int)$pdo->lastInsertId();

    sendJsonResponse(201, [
        'success'    => true,
        'message'    => 'Thank you! Your enquiry has been received. Our team will contact you shortly.',
        'contact_id' => $messageId
    ]);
} catch (PDOException $e) {
    sendJsonResponse(500, [
        'success' => false,
        'message' => 'Failed to save contact message: ' . $e->getMessage()
    ]);
}
