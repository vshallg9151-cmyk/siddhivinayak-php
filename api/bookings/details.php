<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

$bookingId = trim($_GET['bookingId'] ?? $_GET['id'] ?? '');

if (empty($bookingId)) {
    sendResponse(false, 'Booking ID is required.', null, 400);
}

try {
    $db = Database::getConnection();

    $stmt = $db->prepare("SELECT * FROM `bookings` WHERE `booking_id` = :bid OR `id` = :id LIMIT 1");
    $stmt->execute([':bid' => $bookingId, ':id' => $bookingId]);
    $b = $stmt->fetch();

    if (!$b) {
        sendResponse(false, 'Booking not found.', null, 404);
    }

    $authUser = getAuthenticatedUser($db);
    if ($authUser && $authUser['role'] === 'USER') {
        if ($b['user_id'] !== $authUser['id'] && strtolower($b['user_email']) !== strtolower($authUser['email'])) {
            sendResponse(false, 'Unauthorized. You cannot view another customer\'s booking details.', null, 403);
        }
    }

    $booking = [
        'bookingId'       => $b['booking_id'],
        'userId'          => $b['user_id'],
        'userName'        => $b['user_name'],
        'userEmail'       => $b['user_email'],
        'userPhone'       => $b['user_phone'],
        'vehicleId'       => $b['vehicle_id'],
        'vehicleName'     => $b['vehicle_name'],
        'vehicleImage'    => $b['vehicle_image'],
        'pickupCity'      => $b['pickup_city'],
        'dropCity'        => $b['drop_city'],
        'deliveryOption'  => $b['delivery_option'],
        'pickupDate'      => $b['pickup_date'],
        'pickupTime'      => $b['pickup_time'],
        'returnDate'      => $b['return_date'],
        'returnTime'      => $b['return_time'],
        'rentalType'      => $b['rental_type'],
        'dlNumber'        => $b['dl_number'],
        'dlUploaded'      => (bool)$b['dl_uploaded'],
        'idUploaded'      => (bool)$b['id_uploaded'],
        'totalDays'       => intval($b['total_days']),
        'baseFare'        => floatval($b['base_fare']),
        'driverAllowance' => floatval($b['driver_allowance']),
        'deliveryCharge'  => floatval($b['delivery_charge']),
        'taxes'           => floatval($b['taxes']),
        'securityDeposit' => floatval($b['security_deposit']),
        'totalAmount'     => floatval($b['total_amount']),
        'paymentStatus'   => $b['payment_status'],
        'bookingStatus'   => $b['booking_status'],
        'createdAt'       => $b['created_at'],
        'updatedAt'       => $b['updated_at']
    ];

    sendResponse(true, 'Booking details retrieved', [
        'booking' => $booking
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to fetch booking details: ' . $e->getMessage(), null, 500);
}
