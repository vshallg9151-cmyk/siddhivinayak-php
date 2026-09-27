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
        $cityId = trim($data['id'] ?? $data['cityId'] ?? $_GET['id'] ?? '');
        if (empty($cityId)) {
            sendResponse(false, 'City ID is required to delete.', null, 400);
        }

        $stmt = $db->prepare("DELETE FROM `cities` WHERE `id` = :id");
        $stmt->execute([':id' => $cityId]);
        sendResponse(true, 'City deleted successfully.');
    }

    // 2. ADD OR UPDATE ACTION
    $cityId   = trim($data['id'] ?? $data['cityId'] ?? '');
    $name     = trim($data['name'] ?? '');
    $district = trim($data['district'] ?? $name);
    $state    = trim($data['state'] ?? 'Maharashtra');
    $popular  = isset($data['popular']) ? (int)(bool)$data['popular'] : 0;
    $status   = strtoupper(trim($data['status'] ?? 'AVAILABLE'));

    if (empty($name)) {
        sendResponse(false, 'City name is required.', null, 400);
    }

    if (!empty($cityId)) {
        $checkStmt = $db->prepare("SELECT `id` FROM `cities` WHERE `id` = :id LIMIT 1");
        $checkStmt->execute([':id' => $cityId]);
        if ($checkStmt->fetch()) {
            $upStmt = $db->prepare("
                UPDATE `cities` 
                SET `name` = :name, `district` = :district, `state` = :state, `popular` = :popular, `status` = :status, `updated_at` = NOW()
                WHERE `id` = :id
            ");
            $upStmt->execute([
                ':name'     => $name,
                ':district' => $district,
                ':state'    => $state,
                ':popular'  => $popular,
                ':status'   => $status,
                ':id'       => $cityId
            ]);

            sendResponse(true, "City '{$name}' updated successfully.");
        }
    }

    // Insert new city
    $newCityId = strtolower(preg_replace('/[^a-zA-Z0-9]/', '-', $name)) . '-' . rand(10, 99);
    $insStmt = $db->prepare("
        INSERT INTO `cities` (`id`, `name`, `district`, `state`, `popular`, `status`, `created_at`)
        VALUES (:id, :name, :district, :state, :popular, :status, NOW())
    ");
    $insStmt->execute([
        ':id'       => $newCityId,
        ':name'     => $name,
        ':district' => $district,
        ':state'    => $state,
        ':popular'  => $popular,
        ':status'   => $status
    ]);

    sendResponse(true, "City '{$name}' added successfully to active hubs.", [
        'city' => [
            'id'       => $newCityId,
            'name'     => $name,
            'district' => $district,
            'state'    => $state,
            'popular'  => (bool)$popular,
            'status'   => $status
        ]
    ], 201);

} catch (Exception $e) {
    sendResponse(false, 'City management operation failed: ' . $e->getMessage(), null, 500);
}
