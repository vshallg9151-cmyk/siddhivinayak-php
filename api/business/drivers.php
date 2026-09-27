<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

$method = $_SERVER['REQUEST_METHOD'];
$data   = getRequestBody();
$action = trim($_GET['action'] ?? $data['action'] ?? '');

try {
    $db = Database::getConnection();
    $admin = requireAdminRole($db);

    if ($method === 'DELETE' || $action === 'delete') {
        $driverId = trim($data['id'] ?? $_GET['id'] ?? '');
        if (empty($driverId)) {
            sendResponse(false, 'Driver ID is required.', null, 400);
        }
        $stmt = $db->prepare("DELETE FROM `drivers` WHERE `id` = :id");
        $stmt->execute([':id' => $driverId]);
        sendResponse(true, 'Driver removed successfully.');
    }

    $name        = trim($data['name'] ?? '');
    $phone       = trim($data['phone'] ?? '');
    $licenseNo   = trim($data['licenseNo'] ?? $data['license_no'] ?? 'GJ-05-2024-' . rand(100000, 999999));
    $vehicleNo   = trim($data['vehicleNo'] ?? $data['vehicle_no'] ?? 'GJ-05-ST-2919');
    $vehicleType = trim($data['vehicleType'] ?? $data['vehicle_type'] ?? 'Innova Crysta 2.4 AT');

    if (empty($name) || empty($phone)) {
        sendResponse(false, 'Driver Name and Phone Number are required.', null, 400);
    }

    $newId = 'drv-' . time() . '-' . rand(10, 99);
    $insStmt = $db->prepare("
        INSERT INTO `drivers` (
            `id`, `name`, `phone`, `license_no`, `vehicle_no`, `vehicle_type`, `rating`, `assigned_trip`, `status`, `created_at`
        ) VALUES (
            :id, :name, :phone, :lic, :vno, :vtype, 4.90, 'Available for Duty', 'Available', NOW()
        )
    ");
    $insStmt->execute([
        ':id'    => $newId,
        ':name'  => $name,
        ':phone' => $phone,
        ':lic'   => $licenseNo,
        ':vno'   => $vehicleNo,
        ':vtype' => $vehicleType
    ]);

    sendResponse(true, "Driver '{$name}' onboarded successfully.", [
        'driver' => [
            'id'           => $newId,
            'name'         => $name,
            'phone'        => $phone,
            'licenseNo'    => $licenseNo,
            'vehicleNo'    => $vehicleNo,
            'vehicleType'  => $vehicleType,
            'rating'       => 4.90,
            'assignedTrip' => 'Available for Duty',
            'status'       => 'Available'
        ]
    ], 201);

} catch (Exception $e) {
    sendResponse(false, 'Driver operation failed: ' . $e->getMessage(), null, 500);
}
