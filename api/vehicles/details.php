<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

$id = trim($_GET['id'] ?? '');

if (empty($id)) {
    sendResponse(false, 'Vehicle ID is required.', null, 400);
}

try {
    $db = Database::getConnection();

    $stmt = $db->prepare("
        SELECT * FROM `vehicles` 
        WHERE `id` = :id 
           OR LOWER(`name`) = LOWER(:name) 
           OR `reg_number` = :reg 
        LIMIT 1
    ");
    $stmt->execute([
        ':id'   => $id,
        ':name' => $id,
        ':reg'  => $id
    ]);
    $v = $stmt->fetch();

    if (!$v) {
        sendResponse(false, 'Vehicle not found.', null, 404);
    }

    $imgs = json_decode($v['images'] ?? '[]', true) ?: [];
    if (empty($imgs)) {
        $imgs = ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'];
    }

    $vehicle = [
        'id'               => $v['id'],
        'name'             => $v['name'],
        'brand'            => $v['brand'],
        'model'            => $v['model'],
        'category'         => $v['category'],
        'categoryTag'      => $v['category'],
        'regNumber'        => $v['reg_number'],
        'fuelType'         => $v['fuel_type'],
        'transmission'     => $v['transmission'],
        'seats'            => intval($v['seats']),
        'seatingLabel'     => $v['seats'] . ' Seater',
        'pricePerDay'      => floatval($v['price_per_day']),
        'securityDeposit'  => floatval($v['security_deposit']),
        'location'         => $v['location'],
        'image'            => $imgs[0],
        'gallery'          => $imgs,
        'images'           => $imgs,
        'status'           => $v['status'],
        'rating'           => floatval($v['rating']),
        'reviewsCount'     => intval($v['reviews_count']),
        'availableStatus'  => ($v['status'] === 'AVAILABLE') ? 'Available Now' : $v['status'],
        'unlimitedKmAvailable' => true,
        'selfDriveEligible'    => true,
        'chauffeurEligible'    => true,
        'depositText'          => '₹' . number_format($v['security_deposit']) . ' Security Deposit (100% Refundable)'
    ];

    sendResponse(true, 'Vehicle details retrieved successfully', [
        'vehicle' => $vehicle
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to fetch vehicle: ' . $e->getMessage(), null, 500);
}
