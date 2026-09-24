<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$userId      = trim($data['id'] ?? $data['userId'] ?? '');
$name        = trim($data['name'] ?? '');
$mobile      = trim($data['mobile'] ?? '');
$oldPassword = trim($data['oldPassword'] ?? '');
$newPassword = trim($data['newPassword'] ?? '');

if (empty($userId)) {
    sendResponse(false, 'User ID is required.', null, 400);
}

try {
    $db = Database::getConnection();

    $stmt = $db->prepare("SELECT * FROM `users` WHERE `id` = :id LIMIT 1");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();

    if (!$user) {
        sendResponse(false, 'User not found.', null, 404);
    }

    $updates = [];
    $params = [':id' => $userId];

    if (!empty($name)) {
        $updates[] = "`name` = :name";
        $params[':name'] = $name;
    }

    if (!empty($mobile)) {
        $mobVal = validateIndianMobile($mobile);
        if (!$mobVal['valid']) {
            sendResponse(false, $mobVal['error'], null, 400);
        }
        $updates[] = "`mobile` = :mobile";
        $params[':mobile'] = $mobVal['cleanMobile'];
    }

    // Password change verification
    if (!empty($newPassword)) {
        if (empty($oldPassword)) {
            sendResponse(false, 'Current password is required to set a new password.', null, 400);
        }
        if (!verifyUserPassword($oldPassword, $user['password'])) {
            sendResponse(false, 'Incorrect current password.', null, 400);
        }
        if (strlen($newPassword) < 6) {
            sendResponse(false, 'New password must be at least 6 characters.', null, 400);
        }
        $updates[] = "`password` = :newPass";
        $updates[] = "`must_change_password` = 0";
        $params[':newPass'] = hashUserPassword($newPassword);
    }

    if (!empty($updates)) {
        $sql = "UPDATE `users` SET " . implode(', ', $updates) . ", `updated_at` = NOW() WHERE `id` = :id";
        $upStmt = $db->prepare($sql);
        $upStmt->execute($params);
    }

    // Refetch updated user
    $refetchStmt = $db->prepare("SELECT * FROM `users` WHERE `id` = :id LIMIT 1");
    $refetchStmt->execute([':id' => $userId]);
    $updatedUser = $refetchStmt->fetch();

    sendResponse(true, 'Profile updated successfully!', [
        'user' => sanitizeUser($updatedUser)
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to update profile: ' . $e->getMessage(), null, 500);
}
