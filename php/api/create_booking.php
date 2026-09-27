<?php
/**
 * ============================================================================
 * Project: Siddhivinayak Tours & Travels
 * File: php/api/create_booking.php
 * Purpose: Vehicle / Tour Booking Creation Endpoint
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

$userId         = isset($data['user_id']) ? (int)$data['user_id'] : 0;
$vehicleType    = trim($data['vehicle_type'] ?? '');
$pickupLocation = trim($data['pickup_location'] ?? '');
$destination    = trim($data['destination'] ?? '');
$travelDate     = trim($data['travel_date'] ?? '');
$passengers     = isset($data['passengers']) ? (int)$data['passengers'] : 1;
$status         = trim($data['status'] ?? 'CONFIRMED');

// Allowed status values
$allowedStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
if (!in_array($status, $allowedStatuses, true)) {
    $status = 'CONFIRMED';
}

// 3. Field Validations
if ($userId <= 0 || empty($vehicleType) || empty($pickupLocation) || empty($destination) || empty($travelDate)) {
    sendJsonResponse(400, [
        'success' => false,
        'message' => 'Validation error: user_id, vehicle_type, pickup_location, destination, and travel_date are required.'
    ]);
}

if ($passengers < 1) {
    sendJsonResponse(400, [
        'success' => false,
        'message' => 'Passenger count must be at least 1.'
    ]);
}

// 4. Database Operations
try {
    $pdo = getDatabaseConnection();

    // Verify user exists in database
    $userCheck = $pdo->prepare('SELECT id, name, email FROM users WHERE id = :user_id LIMIT 1');
    $userCheck->execute([':user_id' => $userId]);
    $user = $userCheck->fetch();

    if (!$user) {
        sendJsonResponse(404, [
            'success' => false,
            'message' => 'User not found. Please provide a valid user_id.'
        ]);
    }

    // Insert booking record using prepared statement
    $stmt = $pdo->prepare(
        'INSERT INTO bookings (user_id, vehicle_type, pickup_location, destination, travel_date, passengers, status, created_at)
         VALUES (:user_id, :vehicle_type, :pickup_location, :destination, :travel_date, :passengers, :status, NOW())'
    );

    $stmt->execute([
        ':user_id'         => $userId,
        ':vehicle_type'    => $vehicleType,
        ':pickup_location' => $pickupLocation,
        ':destination'     => $destination,
        ':travel_date'     => $travelDate,
        ':passengers'      => $passengers,
        ':status'          => $status
    ]);

    $bookingId = (int)$pdo->lastInsertId();

    sendJsonResponse(201, [
        'success' => true,
        'message' => 'Booking created successfully.',
        'booking' => [
            'id'              => $bookingId,
            'user_id'         => $userId,
            'customer_name'   => $user['name'],
            'customer_email'  => $user['email'],
            'vehicle_type'    => $vehicleType,
            'pickup_location' => $pickupLocation,
            'destination'     => $destination,
            'travel_date'     => $travelDate,
            'passengers'      => $passengers,
            'status'          => $status
        ]
    ]);
} catch (PDOException $e) {
    sendJsonResponse(500, [
        'success' => false,
        'message' => 'Failed to create booking: ' . $e->getMessage()
    ]);
}
