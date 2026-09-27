<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

try {
    $db = Database::getConnection();
    $user = getAuthenticatedUser($db);

    if (!$user) {
        sendResponse(false, 'Unauthenticated session', null, 401);
    }

    sendResponse(true, 'User session valid', [
        'user' => sanitizeUser($user)
    ]);
} catch (Exception $e) {
    sendResponse(false, 'Auth check failed: ' . $e->getMessage(), null, 500);
}
