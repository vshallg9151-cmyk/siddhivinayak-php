<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$bookingId = trim($data['bookingId'] ?? $data['booking_id'] ?? $data['id'] ?? '');

if (empty($bookingId)) {
    sendResponse(false, 'Booking ID is required to cancel reservation.', null, 400);
}

try {
    $db = Database::getConnection();

    $stmt = $db->prepare("SELECT * FROM `bookings` WHERE `booking_id` = :bid OR `id` = :id LIMIT 1");
    $stmt->execute([':bid' => $bookingId, ':id' => $bookingId]);
    $booking = $stmt->fetch();

    if (!$booking) {
        sendResponse(false, 'Booking not found.', null, 404);
    }

    $authUser = getAuthenticatedUser($db);
    if ($authUser && $authUser['role'] === 'USER') {
        if ($booking['user_id'] !== $authUser['id'] && strtolower($booking['user_email']) !== strtolower($authUser['email'])) {
            sendResponse(false, 'Unauthorized. You cannot cancel another customer\'s booking.', null, 403);
        }
    }

    $upStmt = $db->prepare("
        UPDATE `bookings` 
        SET `booking_status` = 'CANCELLED', `payment_status` = 'REFUNDED', `updated_at` = NOW() 
        WHERE `booking_id` = :bid
    ");
    $upStmt->execute([':bid' => $booking['booking_id']]);

    // Update Ledger
    $ledStmt = $db->prepare("UPDATE `accounting_ledger` SET `status` = 'Refunded' WHERE `transaction_id` = :txid");
    $ledStmt->execute([':txid' => 'tx-' . $booking['booking_id']]);

    sendResponse(true, "Booking #{$booking['booking_id']} has been cancelled successfully. Any eligible deposit/refund will be processed.", [
        'bookingId'     => $booking['booking_id'],
        'bookingStatus' => 'CANCELLED',
        'paymentStatus' => 'REFUNDED'
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to cancel booking: ' . $e->getMessage(), null, 500);
}
