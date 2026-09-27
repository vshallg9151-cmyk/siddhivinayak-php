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

    // 1. DELETE ACTION
    if ($method === 'DELETE' || $action === 'delete') {
        $vehId = trim($data['id'] ?? $data['vehicleId'] ?? $_GET['id'] ?? '');
        if (empty($vehId)) {
            sendResponse(false, 'Vehicle ID is required to delete.', null, 400);
        }

        $stmt = $db->prepare("DELETE FROM `vehicles` WHERE `id` = :id");
        $stmt->execute([':id' => $vehId]);
        sendResponse(true, 'Vehicle removed from fleet successfully.');
    }

    // 2. STATUS UPDATE ACTION
    if ($action === 'status') {
        $vehId  = trim($data['id'] ?? $data['vehicleId'] ?? '');
        $status = strtoupper(trim($data['status'] ?? 'AVAILABLE'));

        if (empty($vehId)) {
            sendResponse(false, 'Vehicle ID is required.', null, 400);
        }

        $stmt = $db->prepare("UPDATE `vehicles` SET `status` = :status, `updated_at` = NOW() WHERE `id` = :id");
        $stmt->execute([':status' => $status, ':id' => $vehId]);
        sendResponse(true, "Vehicle status updated to {$status}.");
    }

    // 3. PRICE UPDATE ONLY ACTION (Super Admin Dynamic Pricing)
    if ($action === 'price') {
        $vehId   = trim($data['id'] ?? $data['vehicleId'] ?? '');
        $price   = floatval($data['pricePerDay'] ?? $data['price_per_day'] ?? 0);
        $deposit = floatval($data['securityDeposit'] ?? $data['security_deposit'] ?? 5000);

        if (empty($vehId) || $price <= 0) {
            sendResponse(false, 'Valid Vehicle ID and Price per Day are required.', null, 400);
        }

        $stmt = $db->prepare("
            UPDATE `vehicles` 
            SET `price_per_day` = :price, `security_deposit` = :deposit, `updated_at` = NOW() 
            WHERE `id` = :id
        ");
        $stmt->execute([':price' => $price, ':deposit' => $deposit, ':id' => $vehId]);
        sendResponse(true, "Daily rental rate updated to ₹" . number_format($price) . "/day.");
    }

    // 4. ADD OR FULL UPDATE ACTION
    $vehId = trim($data['id'] ?? $data['vehicleId'] ?? '');

    $name         = trim($data['name'] ?? '');
    $brand        = trim($data['brand'] ?? 'Siddhivinayak Fleet');
    $model        = trim($data['model'] ?? $name);
    $category     = trim($data['category'] ?? 'SUV');
    $regNumber    = trim($data['regNumber'] ?? $data['reg_number'] ?? '');
    $fuelType     = trim($data['fuelType'] ?? $data['fuel_type'] ?? 'Petrol');
    $transmission = trim($data['transmission'] ?? 'Automatic');
    $seats        = intval($data['seats'] ?? 5);
    $pricePerDay  = floatval($data['pricePerDay'] ?? $data['price_per_day'] ?? 3999);
    $deposit      = floatval($data['securityDeposit'] ?? $data['security_deposit'] ?? 5000);
    $location     = trim($data['location'] ?? 'Surat');
    $status       = strtoupper(trim($data['status'] ?? 'AVAILABLE'));
    
    // Images array handling
    $rawImages = $data['images'] ?? ($data['image'] ? [$data['image']] : []);
    if (is_string($rawImages)) {
        $rawImages = [$rawImages];
    }
    if (empty($rawImages)) {
        $rawImages = ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'];
    }
    $imagesJson = json_encode(array_values(array_filter($rawImages)));

    if (empty($name)) {
        sendResponse(false, 'Vehicle name is required.', null, 400);
    }

    if (empty($regNumber)) {
        $regNumber = 'GJ-05-ST-' . rand(1000, 9999);
    }

    // If ID exists and already in database -> UPDATE
    if (!empty($vehId)) {
        $checkStmt = $db->prepare("SELECT `id` FROM `vehicles` WHERE `id` = :id LIMIT 1");
        $checkStmt->execute([':id' => $vehId]);
        if ($checkStmt->fetch()) {
            $upStmt = $db->prepare("
                UPDATE `vehicles` SET
                    `name` = :name,
                    `brand` = :brand,
                    `model` = :model,
                    `category` = :category,
                    `reg_number` = :reg,
                    `fuel_type` = :fuel,
                    `transmission` = :trans,
                    `seats` = :seats,
                    `price_per_day` = :price,
                    `security_deposit` = :deposit,
                    `location` = :location,
                    `images` = :images,
                    `status` = :status,
                    `updated_at` = NOW()
                WHERE `id` = :id
            ");
            $upStmt->execute([
                ':name'     => $name,
                ':brand'    => $brand,
                ':model'    => $model,
                ':category' => $category,
                ':reg'      => $regNumber,
                ':fuel'     => $fuelType,
                ':trans'    => $transmission,
                ':seats'    => $seats,
                ':price'    => $pricePerDay,
                ':deposit'  => $deposit,
                ':location' => $location,
                ':images'   => $imagesJson,
                ':status'   => $status,
                ':id'       => $vehId
            ]);

            sendResponse(true, "Vehicle '{$name}' updated successfully in fleet.", [
                'vehicleId' => $vehId
            ]);
        }
    }

    // ADD NEW VEHICLE
    $newVehId = !empty($vehId) ? $vehId : ('veh-' . time() . '-' . rand(100, 999));

    $insStmt = $db->prepare("
        INSERT INTO `vehicles` (
            `id`, `name`, `brand`, `model`, `category`, `reg_number`, 
            `fuel_type`, `transmission`, `seats`, `price_per_day`, 
            `security_deposit`, `location`, `images`, `status`, `created_at`
        ) VALUES (
            :id, :name, :brand, :model, :category, :reg, 
            :fuel, :trans, :seats, :price, 
            :deposit, :location, :images, :status, NOW()
        )
    ");
    $insStmt->execute([
        ':id'       => $newVehId,
        ':name'     => $name,
        ':brand'    => $brand,
        ':model'    => $model,
        ':category' => $category,
        ':reg'      => $regNumber,
        ':fuel'     => $fuelType,
        ':trans'    => $transmission,
        ':seats'    => $seats,
        ':price'    => $pricePerDay,
        ':deposit'  => $deposit,
        ':location' => $location,
        ':images'   => $imagesJson,
        ':status'   => $status
    ]);

    sendResponse(true, "Vehicle '{$name}' added to fleet successfully.", [
        'vehicleId' => $newVehId
    ], 201);

} catch (Exception $e) {
    sendResponse(false, 'Vehicle management operation failed: ' . $e->getMessage(), null, 500);
}
