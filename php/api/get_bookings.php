<?php
/**
 * ============================================================================
 * Project: Siddhivinayak Tours & Travels
 * File: php/api/get_bookings.php
 * Purpose: Retrieve Bookings Endpoint (Filter by user_id or list all)
 * Method: GET
 * ============================================================================
 */

require_once __DIR__ . '/../config/database.php';

// 1. Verify Request Method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(405, [
        'success' => false,
        'message' => 'Method Not Allowed. Only GET requests are accepted.'
    ]);
}

// 2. Query Parameter Filtering
$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

// 3. Database Operations
try {
    $pdo = getDatabaseConnection();

    if ($userId && $userId > 0) {
        // Fetch bookings for a specific user
        $sql = 'SELECT b.id, b.user_id, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
                       b.vehicle_type, b.pickup_location, b.destination, b.travel_date, b.passengers, b.status, b.created_at
                FROM bookings b
                INNER JOIN users u ON b.user_id = u.id
                WHERE b.user_id = :user_id
                ORDER BY b.id DESC';

        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
    } else {
        // Fetch all bookings (Admin overview)
        $sql = 'SELECT b.id, b.user_id, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
                       b.vehicle_type, b.pickup_location, b.destination, b.travel_date, b.passengers, b.status, b.created_at
                FROM bookings b
                INNER JOIN users u ON b.user_id = u.id
                ORDER BY b.id DESC';

        $stmt = $pdo->query($sql);
    }

    $bookings = $stmt->fetchAll();

    sendJsonResponse(200, [
        'success'  => true,
        'count'    => count($bookings),
        'filter'   => $userId ? ['user_id' => $userId] : 'all',
        'bookings' => $bookings
    ]);
} catch (PDOException $e) {
    sendJsonResponse(500, [
        'success' => false,
        'message' => 'Failed to fetch bookings: ' . $e->getMessage()
    ]);
}
