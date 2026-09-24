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
        $guideId = trim($data['id'] ?? $_GET['id'] ?? '');
        if (empty($guideId)) {
            sendResponse(false, 'Guide ID is required.', null, 400);
        }
        $stmt = $db->prepare("DELETE FROM `guides` WHERE `id` = :id");
        $stmt->execute([':id' => $guideId]);
        sendResponse(true, 'Tour Guide removed successfully.');
    }

    $name         = trim($data['name'] ?? '');
    $languages    = trim($data['languages'] ?? 'English, Hindi, Gujarati');
    $expertise    = trim($data['expertise'] ?? 'Heritage & Temple Tours');
    $location     = trim($data['location'] ?? 'Surat & Somnath');
    $assignedTour = trim($data['assignedTour'] ?? $data['assigned_tour'] ?? 'Heritage & Pilgrimage Tour');

    if (empty($name)) {
        sendResponse(false, 'Guide Name is required.', null, 400);
    }

    $newId = 'gd-' . time() . '-' . rand(10, 99);
    $insStmt = $db->prepare("
        INSERT INTO `guides` (
            `id`, `name`, `languages`, `expertise`, `location`, `rating`, `availability`, `assigned_tour`, `created_at`
        ) VALUES (
            :id, :name, :lang, :exp, :loc, 4.90, 'Available', :atour, NOW()
        )
    ");
    $insStmt->execute([
        ':id'    => $newId,
        ':name'  => $name,
        ':lang'  => $languages,
        ':exp'   => $expertise,
        ':loc'   => $location,
        ':atour' => $assignedTour
    ]);

    sendResponse(true, "Tour Guide '{$name}' onboarded successfully.", [
        'guide' => [
            'id'           => $newId,
            'name'         => $name,
            'languages'    => $languages,
            'expertise'    => $expertise,
            'location'     => $location,
            'rating'       => 4.90,
            'availability' => 'Available',
            'assignedTour' => $assignedTour
        ]
    ], 201);

} catch (Exception $e) {
    sendResponse(false, 'Guide operation failed: ' . $e->getMessage(), null, 500);
}
