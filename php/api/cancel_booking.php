<?php
/**
 * ============================================================================
 * Project: Siddhivinayak Tours & Travels
 * File: php/api/cancel_booking.php
 * Purpose: Cancel Booking Endpoint
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
$bookingId = isset($data['booking_id']) ? (int)$data['booking_id'] : (isset($data['id']) ? (int)$data['id'] : 0);

// 3. Field Validations
if ($bookingId <= 0) {
    sendJsonResponse(400, [
        'success' => false,
        'message' => 'Validation error: A valid booking_id is required.'
    ]);
}

// 4. Database Operations
try {
    $pdo = getDatabaseConnection();

    // Check if booking exists
    $checkStmt = $pdo->prepare('SELECT id, user_id, status FROM bookings WHERE id = :id LIMIT 1');
    $checkStmt->execute([':id' => $bookingId]);
    $booking = $checkStmt->fetch();

    if (!$booking) {
        sendJsonResponse(404, [
            'success' => false,
            'message' => "Booking with ID #{$bookingId} does not exist."
        ]);
    }

    if ($booking['status'] === 'CANCELLED') {
        sendJsonResponse(200, [
            'success' => true,
            'message' => "Booking #{$bookingId} is already marked as CANCELLED.",
            'booking_id' => $bookingId,
            'status'     => 'CANCELLED'
        ]);
    }

    // Update status to CANCELLED using prepared statement
    $updateStmt = $pdo->prepare("UPDATE bookings SET status = 'CANCELLED' WHERE id = :id");
    $updateStmt->execute([':id' => $bookingId]);

    sendJsonResponse(200, [
        'success'    => true,
        'message'    => "Booking #{$bookingId} has been successfully cancelled.",
        'booking_id' => $bookingId,
        'status'     => 'CANCELLED'
    ]);
} catch (PDOException $e) {
    sendJsonResponse(500, [
        'success' => false,
        'message' => 'Failed to cancel booking: ' . $e->getMessage()
    ]);
}
