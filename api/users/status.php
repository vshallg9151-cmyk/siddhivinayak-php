<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$userId    = trim($data['id'] ?? $data['userId'] ?? '');
$newStatus = trim($data['status'] ?? '');

if (empty($userId)) {
    sendResponse(false, 'User ID is required.', null, 400);
}

try {
    $db = Database::getConnection();
    $admin = requireAdminRole($db);

    $stmt = $db->prepare("SELECT * FROM `users` WHERE `id` = :id LIMIT 1");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();

    if (!$user) {
        sendResponse(false, 'User not found.', null, 404);
    }

    if ($user['is_owner']) {
        sendResponse(false, 'Cannot deactivate Primary Super Admin Owner account.', null, 403);
    }

    // Toggle status if not explicitly passed
    if (empty($newStatus)) {
        $nextStatus = ($user['status'] === 'ACTIVE') ? 'DISABLED' : 'ACTIVE';
    } else {
        $nextStatus = strtoupper($newStatus);
    }

    $updateStmt = $db->prepare("UPDATE `users` SET `status` = :status, `updated_at` = NOW() WHERE `id` = :id");
    $updateStmt->execute([':status' => $nextStatus, ':id' => $userId]);

    $user['status'] = $nextStatus;

    sendResponse(true, "User status updated to {$nextStatus} successfully.", [
        'user' => sanitizeUser($user)
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to update user status: ' . $e->getMessage(), null, 500);
}
