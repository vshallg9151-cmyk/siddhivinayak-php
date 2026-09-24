<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

try {
    $db = Database::getConnection();

    $userId    = trim($_GET['userId'] ?? $_GET['user_id'] ?? '');
    $email     = trim($_GET['email'] ?? '');
    $status    = strtoupper(trim($_GET['status'] ?? $_GET['bookingStatus'] ?? ''));
    $vehicleId = trim($_GET['vehicleId'] ?? $_GET['vehicle_id'] ?? '');

    $authUser = getAuthenticatedUser($db);
    if ($authUser && $authUser['role'] === 'USER') {
        // Enforce user's own bookings
        $userId = $authUser['id'];
        $email  = $authUser['email'];
    } else if (empty($userId) && empty($email) && empty($vehicleId)) {
        // Unrestricted listing of all customer bookings requires admin privileges
        requireAdminRole($db);
    }

    $query = "SELECT * FROM `bookings` WHERE 1=1";
    $params = [];

    if (!empty($userId)) {
        if (!empty($email)) {
            $query .= " AND (`user_id` = :uid OR LOWER(`user_email`) = LOWER(:email))";
            $params[':uid'] = $userId;
            $params[':email'] = $email;
        } else {
            $query .= " AND `user_id` = :uid";
            $params[':uid'] = $userId;
        }
    } else if (!empty($email)) {
        $query .= " AND LOWER(`user_email`) = LOWER(:email)";
        $params[':email'] = $email;
    }

    if (!empty($status) && $status !== 'ALL') {
        $query .= " AND `booking_status` = :status";
        $params[':status'] = $status;
    }

    if (!empty($vehicleId)) {
        $query .= " AND `vehicle_id` = :vid";
        $params[':vid'] = $vehicleId;
    }

    $query .= " ORDER BY `created_at` DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $bookings = $stmt->fetchAll();

    $formatted = array_map(function($b) {
        return [
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
    }, $bookings);

    sendResponse(true, 'Bookings retrieved successfully', [
        'bookings' => $formatted,
        'count'    => count($formatted)
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to fetch bookings: ' . $e->getMessage(), null, 500);
}
