<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$userId = trim($data['id'] ?? $data['userId'] ?? $_GET['id'] ?? '');

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
        sendResponse(false, 'Cannot delete the Primary Super Admin Owner account.', null, 403);
    }

    $delStmt = $db->prepare("DELETE FROM `users` WHERE `id` = :id");
    $delStmt->execute([':id' => $userId]);

    sendResponse(true, 'User account deleted successfully.');

} catch (Exception $e) {
    sendResponse(false, 'Failed to delete user: ' . $e->getMessage(), null, 500);
}
