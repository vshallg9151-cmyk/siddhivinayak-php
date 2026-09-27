<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

try {
    $db = Database::getConnection();

    $category     = trim($_GET['category'] ?? '');
    $location     = trim($_GET['location'] ?? '');
    $status       = trim($_GET['status'] ?? '');
    $fuel         = trim($_GET['fuel'] ?? '');
    $transmission = trim($_GET['transmission'] ?? '');
    $seats        = intval($_GET['seats'] ?? 0);
    $search       = trim($_GET['search'] ?? '');
    $minPrice     = floatval($_GET['min_price'] ?? 0);
    $maxPrice     = floatval($_GET['max_price'] ?? 0);

    $query = "SELECT * FROM `vehicles` WHERE 1=1";
    $params = [];

    if (!empty($status) && $status !== 'ALL') {
        $query .= " AND `status` = :status";
        $params[':status'] = strtoupper($status);
    }

    if (!empty($category) && $category !== 'All Cars' && $category !== 'ALL') {
        $query .= " AND (`category` = :cat OR `category` LIKE :catLike)";
        $params[':cat'] = $category;
        $params[':catLike'] = '%' . $category . '%';
    }

    if (!empty($location) && $location !== 'ALL') {
        $query .= " AND `location` LIKE :loc";
        $params[':loc'] = '%' . $location . '%';
    }

    if (!empty($fuel) && $fuel !== 'ALL') {
        $query .= " AND `fuel_type` LIKE :fuel";
        $params[':fuel'] = '%' . $fuel . '%';
    }

    if (!empty($transmission) && $transmission !== 'ALL') {
        $query .= " AND `transmission` LIKE :trans";
        $params[':trans'] = '%' . $transmission . '%';
    }

    if ($seats > 0) {
        $query .= " AND `seats` >= :seats";
        $params[':seats'] = $seats;
    }

    if ($minPrice > 0) {
        $query .= " AND `price_per_day` >= :minP";
        $params[':minP'] = $minPrice;
    }

    if ($maxPrice > 0) {
        $query .= " AND `price_per_day` <= :maxP";
        $params[':maxP'] = $maxPrice;
    }

    if (!empty($search)) {
        $query .= " AND (`name` LIKE :search OR `brand` LIKE :search OR `model` LIKE :search OR `location` LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    $query .= " ORDER BY `price_per_day` ASC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $vehicles = $stmt->fetchAll();

    // Format output
    $formatted = array_map(function($v) {
        $imgs = json_decode($v['images'] ?? '[]', true);
        if (!is_array($imgs) || empty($imgs)) {
            $imgs = ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'];
        }
        $mDates = json_decode($v['maintenance_dates'] ?? '[]', true) ?: [];

        return [
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
            'images'           => $imgs,
            'status'           => $v['status'],
            'rating'           => floatval($v['rating']),
            'reviewsCount'     => intval($v['reviews_count']),
            'maintenanceDates' => $mDates,
            'unlimitedKmAvailable' => true,
            'selfDriveEligible'    => true,
            'chauffeurEligible'    => true,
            'depositText'          => '₹' . number_format($v['security_deposit']) . ' Security Deposit (100% Refundable)'
        ];
    }, $vehicles);

    sendResponse(true, 'Vehicles retrieved successfully', [
        'vehicles' => $formatted,
        'count'    => count($formatted)
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to retrieve vehicles: ' . $e->getMessage(), null, 500);
}
