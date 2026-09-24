<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PATCH' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$bookingId     = trim($data['bookingId'] ?? $data['booking_id'] ?? $data['id'] ?? '');
$bookingStatus = strtoupper(trim($data['bookingStatus'] ?? $data['booking_status'] ?? $data['status'] ?? ''));
$paymentStatus = strtoupper(trim($data['paymentStatus'] ?? $data['payment_status'] ?? ''));

if (empty($bookingId)) {
    sendResponse(false, 'Booking ID is required.', null, 400);
}

try {
    $db = Database::getConnection();
    $admin = requireAdminRole($db);

    $stmt = $db->prepare("SELECT * FROM `bookings` WHERE `booking_id` = :bid OR `id` = :id LIMIT 1");
    $stmt->execute([':bid' => $bookingId, ':id' => $bookingId]);
    $booking = $stmt->fetch();

    if (!$booking) {
        sendResponse(false, 'Booking not found.', null, 404);
    }

    $updates = [];
    $params = [':bid' => $booking['booking_id']];

    if (!empty($bookingStatus)) {
        $updates[] = "`booking_status` = :bstatus";
        $params[':bstatus'] = $bookingStatus;
    }

    if (!empty($paymentStatus)) {
        $updates[] = "`payment_status` = :pstatus";
        $params[':pstatus'] = $paymentStatus;
    }

    if (empty($updates)) {
        sendResponse(false, 'No fields provided to update.', null, 400);
    }

    $sql = "UPDATE `bookings` SET " . implode(', ', $updates) . ", `updated_at` = NOW() WHERE `booking_id` = :bid";
    $upStmt = $db->prepare($sql);
    $upStmt->execute($params);

    // If payment status changed, also update ledger
    if (!empty($paymentStatus)) {
        $ledgerStatus = ($paymentStatus === 'PAID') ? 'Received' : 'Pending';
        $ledStmt = $db->prepare("UPDATE `accounting_ledger` SET `status` = :lstat WHERE `transaction_id` = :txid");
        $ledStmt->execute([':lstat' => $ledgerStatus, ':txid' => 'tx-' . $booking['booking_id']]);
    }

    sendResponse(true, "Booking #{$booking['booking_id']} status updated successfully.", [
        'bookingId'     => $booking['booking_id'],
        'bookingStatus' => $bookingStatus ?: $booking['booking_status'],
        'paymentStatus' => $paymentStatus ?: $booking['payment_status']
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to update booking: ' . $e->getMessage(), null, 500);
}
