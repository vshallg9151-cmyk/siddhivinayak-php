<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

try {
    $db = Database::getConnection();
    $user = getAuthenticatedUser($db);

    if ($user) {
        $stmt = $db->prepare("UPDATE `users` SET `auth_token` = NULL WHERE `id` = :id");
        $stmt->execute([':id' => $user['id']]);
    }

    sendResponse(true, 'Logged out successfully');
} catch (Exception $e) {
    sendResponse(true, 'Logged out successfully');
}
