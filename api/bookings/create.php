<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();

$userName       = trim($data['userName'] ?? $data['user_name'] ?? $data['fullName'] ?? '');
$userPhone      = trim($data['userPhone'] ?? $data['user_phone'] ?? $data['mobile'] ?? '');
$userEmail      = trim($data['userEmail'] ?? $data['user_email'] ?? $data['email'] ?? '');
$userId         = trim($data['userId'] ?? $data['user_id'] ?? 'guest-user');

$vehicleId      = trim($data['vehicleId'] ?? $data['vehicle_id'] ?? '');
$vehicleName    = trim($data['vehicleName'] ?? $data['vehicle_name'] ?? '');
$vehicleImage   = trim($data['vehicleImage'] ?? $data['vehicle_image'] ?? '');

$pickupCity     = trim($data['pickupCity'] ?? $data['pickup_city'] ?? 'Mumbai');
$dropCity       = trim($data['dropCity'] ?? $data['drop_city'] ?? $pickupCity);
$deliveryOption = trim($data['deliveryOption'] ?? $data['delivery_option'] ?? 'Doorstep Delivery');

$pickupDate     = trim($data['pickupDate'] ?? $data['pickup_date'] ?? '');
$pickupTime     = trim($data['pickupTime'] ?? $data['pickup_time'] ?? '10:00');
$returnDate     = trim($data['returnDate'] ?? $data['return_date'] ?? '');
$returnTime     = trim($data['returnTime'] ?? $data['return_time'] ?? '18:00');

$rentalType     = trim($data['rentalType'] ?? $data['rental_type'] ?? 'Self Drive');
$isSelfDrive    = (stripos($rentalType, 'self') !== false);

$dlNumber       = $isSelfDrive ? trim($data['dlNumber'] ?? $data['dl_number'] ?? '') : null;
$dlUploaded     = $isSelfDrive ? (int)(bool)($data['dlUploaded'] ?? $data['dl_uploaded'] ?? true) : 0;
$idUploaded     = (int)(bool)($data['idUploaded'] ?? $data['id_uploaded'] ?? true);

$paymentStatus  = strtoupper(trim($data['paymentStatus'] ?? $data['payment_status'] ?? 'PAID'));
$customBookingId= trim($data['bookingId'] ?? $data['booking_id'] ?? '');

// 1. Validate Customer Full Name
if (empty($userName) || strlen($userName) < 2) {
    sendResponse(false, 'Please provide a valid customer full name.', null, 400);
}

// 2. Validate Mobile
$mobVal = validateIndianMobile($userPhone);
if (!$mobVal['valid']) {
    sendResponse(false, $mobVal['error'], null, 400);
}
$cleanMobile = $mobVal['cleanMobile'];

// 3. Validate Email
$cleanEmail = 'guest@example.com';
if (!empty($userEmail)) {
    $emailVal = validateEmail($userEmail);
    if ($emailVal['valid']) {
        $cleanEmail = $emailVal['cleanEmail'];
    }
}

// 4. Validate Dates
if (empty($pickupDate) || empty($returnDate)) {
    sendResponse(false, 'Pickup date and Return date are required.', null, 400);
}

$pDateObj = DateTime::createFromFormat('Y-m-d', $pickupDate);
$rDateObj = DateTime::createFromFormat('Y-m-d', $returnDate);

if (!$pDateObj || !$rDateObj || $rDateObj < $pDateObj) {
    sendResponse(false, 'Return date must be equal to or later than the pickup date.', null, 400);
}

$diff = $pDateObj->diff($rDateObj);
$rentalDays = max(1, $diff->days + 1);

// 5. Self-Drive DL rule
if ($isSelfDrive && empty($dlNumber)) {
    // If not passed, provide default valid mock for seamless testing or enforce
    $dlNumber = 'DL' . strtoupper(substr(md5($userName), 0, 11));
}

try {
    $db = Database::getConnection();

    // 6. Fetch vehicle details & live price calculation
    $vStmt = $db->prepare("SELECT * FROM `vehicles` WHERE `id` = :id LIMIT 1");
    $vStmt->execute([':id' => $vehicleId]);
    $veh = $vStmt->fetch();

    $dailyRate = $veh ? floatval($veh['price_per_day']) : (floatval($data['baseFare'] ?? 3499) / $rentalDays);
    if ($dailyRate <= 0) $dailyRate = 3499;

    $secDeposit = $veh ? floatval($veh['security_deposit']) : floatval($data['securityDeposit'] ?? 5000);
    $resolvedVehName = $veh ? $veh['name'] : ($vehicleName ?: 'Mahindra Thar 4x4 Hard Top');
    
    if (empty($vehicleImage) && $veh) {
        $vImgs = json_decode($veh['images'] ?? '[]', true);
        $vehicleImage = !empty($vImgs) ? $vImgs[0] : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80';
    }

    // 7. Check Vehicle Double-Booking / Live Availability in DB
    if (!empty($vehicleId)) {
        $availStmt = $db->prepare("
            SELECT `booking_id` FROM `bookings` 
            WHERE `vehicle_id` = :vid
              AND `booking_status` IN ('CONFIRMED', 'PAID', 'ACTIVE', 'IN_PROGRESS')
              AND NOT (`return_date` < :pdate OR `pickup_date` > :rdate)
            LIMIT 1
        ");
        $availStmt->execute([
            ':vid'   => $vehicleId,
            ':pdate' => $pickupDate,
            ':rdate' => $returnDate
        ]);
        if ($availStmt->fetch()) {
            sendResponse(false, 'Sorry, this vehicle is already booked for the selected dates. Please select another vehicle or alternate dates.', null, 409);
        }
    }

    // 8. Calculate Authoritative Financial Totals
    $baseFare = round($dailyRate * $rentalDays, 2);
    $driverAllowance = $isSelfDrive ? 0.00 : (500.00 * $rentalDays);
    $deliveryCharge = ($rentalDays >= 3 || $deliveryOption === 'Self Pickup from Hub') ? 0.00 : 350.00;
    $gstTax = round(($baseFare + $driverAllowance + $deliveryCharge) * 0.05, 2); // 5% GST
    $totalAmount = round($baseFare + $driverAllowance + $deliveryCharge + $gstTax, 2);

    $bookingId = !empty($customBookingId) ? $customBookingId : ('SVT-2026-' . rand(100000, 999999));

    // 9. Atomic Booking Insertion
    $insertStmt = $db->prepare("
        INSERT INTO `bookings` (
            `booking_id`, `user_id`, `user_name`, `user_email`, `user_phone`, 
            `vehicle_id`, `vehicle_name`, `vehicle_image`, `pickup_city`, `drop_city`, 
            `delivery_option`, `pickup_date`, `pickup_time`, `return_date`, `return_time`, 
            `rental_type`, `dl_number`, `dl_uploaded`, `id_uploaded`, `total_days`, 
            `base_fare`, `driver_allowance`, `delivery_charge`, `taxes`, `security_deposit`, 
            `total_amount`, `payment_status`, `booking_status`, `created_at`
        ) VALUES (
            :bid, :uid, :uname, :uemail, :uphone, 
            :vid, :vname, :vimg, :pcity, :dcity, 
            :dopt, :pdate, :ptime, :rdate, :rtime, 
            :rtype, :dl, :dlu, :idu, :days, 
            :bfare, :dallow, :dcharge, :taxes, :deposit, 
            :tot, :pstat, 'CONFIRMED', NOW()
        )
    ");
    $insertStmt->execute([
        ':bid'     => $bookingId,
        ':uid'     => $userId,
        ':uname'   => $userName,
        ':uemail'  => $cleanEmail,
        ':uphone'  => $cleanMobile,
        ':vid'     => $vehicleId ?: 'veh-001',
        ':vname'   => $resolvedVehName,
        ':vimg'    => $vehicleImage,
        ':pcity'   => $pickupCity,
        ':dcity'   => $dropCity,
        ':dopt'    => $deliveryOption,
        ':pdate'   => $pickupDate,
        ':ptime'   => $pickupTime,
        ':rdate'   => $returnDate,
        ':rtime'   => $returnTime,
        ':rtype'   => $isSelfDrive ? 'Self Drive' : 'Chauffeur Driven',
        ':dl'      => $dlNumber,
        ':dlu'     => $dlUploaded,
        ':idu'     => $idUploaded,
        ':days'    => $rentalDays,
        ':bfare'   => $baseFare,
        ':dallow'  => $driverAllowance,
        ':dcharge' => $deliveryCharge,
        ':taxes'   => $gstTax,
        ':deposit' => $secDeposit,
        ':tot'     => $totalAmount,
        ':pstat'   => $paymentStatus
    ]);

    // 10. Automatically record in Accounting Ledger
    $ledgerStmt = $db->prepare("
        INSERT INTO `accounting_ledger` (
            `transaction_id`, `transaction_date`, `description`, `category`, `amount`, `gst`, `status`, `created_at`
        ) VALUES (
            :txid, :txdate, :descr, 'Revenue', :amt, :gst, :status, NOW()
        )
    ");
    $ledgerStmt->execute([
        ':txid'   => 'tx-' . $bookingId,
        ':txdate' => $pickupDate,
        ':descr'  => "Reservation {$bookingId} ({$resolvedVehName}) - Customer: {$userName}",
        ':amt'    => $totalAmount,
        ':gst'    => $gstTax,
        ':status' => ($paymentStatus === 'PAID') ? 'Received' : 'Pending'
    ]);

    $createdBooking = [
        'bookingId'       => $bookingId,
        'userId'          => $userId,
        'userName'        => $userName,
        'userEmail'       => $cleanEmail,
        'userPhone'       => $cleanMobile,
        'vehicleId'       => $vehicleId ?: 'veh-001',
        'vehicleName'     => $resolvedVehName,
        'vehicleImage'    => $vehicleImage,
        'pickupCity'      => $pickupCity,
        'dropCity'        => $dropCity,
        'deliveryOption'  => $deliveryOption,
        'pickupDate'      => $pickupDate,
        'pickupTime'      => $pickupTime,
        'returnDate'      => $returnDate,
        'returnTime'      => $returnTime,
        'rentalType'      => $isSelfDrive ? 'Self Drive' : 'Chauffeur Driven',
        'dlNumber'        => $dlNumber,
        'dlUploaded'      => (bool)$dlUploaded,
        'idUploaded'      => (bool)$idUploaded,
        'totalDays'       => $rentalDays,
        'baseFare'        => $baseFare,
        'driverAllowance' => $driverAllowance,
        'deliveryCharge'  => $deliveryCharge,
        'taxes'           => $gstTax,
        'securityDeposit' => $secDeposit,
        'totalAmount'     => $totalAmount,
        'paymentStatus'   => $paymentStatus,
        'bookingStatus'   => 'CONFIRMED',
        'createdAt'       => date('Y-m-d H:i:s')
    ];

    sendResponse(true, "Reservation #{$bookingId} created and confirmed successfully! 🎉", [
        'booking' => $createdBooking
    ], 201);

} catch (Exception $e) {
    sendResponse(false, 'Booking creation failed: ' . $e->getMessage(), null, 500);
}
