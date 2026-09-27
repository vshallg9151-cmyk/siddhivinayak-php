<?php
/**
 * Change Password API Endpoint
 * Siddhivinayak Tours & Travels - PHP API Layer
 * 
 * Allows authenticated users (or requests with current credentials) to update their password.
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$currentPassword = trim($data['currentPassword'] ?? $data['current_password'] ?? $data['oldPassword'] ?? $data['old_password'] ?? '');
$newPassword     = trim($data['newPassword'] ?? $data['new_password'] ?? $data['password'] ?? '');
$confirmPassword = trim($data['confirmPassword'] ?? $data['confirm_password'] ?? '');

if (empty($currentPassword)) {
    sendResponse(false, 'Current password is required.', null, 400);
}

if (empty($newPassword)) {
    sendResponse(false, 'New password is required.', null, 400);
}

if (strlen($newPassword) < 6) {
    sendResponse(false, 'New password must be at least 6 characters long.', null, 400);
}

if (!empty($confirmPassword) && $newPassword !== $confirmPassword) {
    sendResponse(false, 'New password and confirmation do not match.', null, 400);
}

if ($currentPassword === $newPassword) {
    sendResponse(false, 'New password must be different from current password.', null, 400);
}

try {
    $db = Database::getConnection();

    // 1. Identify user via Bearer token or identifier in request body
    $user = getAuthenticatedUser($db);

    if (!$user) {
        $userId = trim($data['userId'] ?? $data['user_id'] ?? '');
        $email  = trim($data['email'] ?? $data['identifier'] ?? '');

        if (!empty($userId)) {
            $stmt = $db->prepare("SELECT * FROM `users` WHERE `id` = :id LIMIT 1");
            $stmt->execute([':id' => $userId]);
            $user = $stmt->fetch();
        } else if (!empty($email)) {
            $stmt = $db->prepare("SELECT * FROM `users` WHERE LOWER(`email`) = LOWER(:email) LIMIT 1");
            $stmt->execute([':email' => $email]);
            $user = $stmt->fetch();
        }
    }

    if (!$user) {
        sendResponse(false, 'Authentication required. Please log in or provide your user ID/email.', null, 401);
    }

    // 2. Verify current password
    if (!verifyUserPassword($currentPassword, $user['password'])) {
        sendResponse(false, 'Current password is incorrect.', null, 400);
    }

    // 3. Hash new password and generate updated auth token
    $hashedPassword = hashUserPassword($newPassword);
    $newToken = generateAuthToken($user);

    $updateStmt = $db->prepare("
        UPDATE `users` 
        SET `password` = :pass, 
            `auth_token` = :token, 
            `must_change_password` = 0, 
            `updated_at` = NOW() 
        WHERE `id` = :id
    ");
    $updateStmt->execute([
        ':pass'  => $hashedPassword,
        ':token' => $newToken,
        ':id'    => $user['id']
    ]);

    // 4. Refetch refreshed user record
    $refetchStmt = $db->prepare("SELECT * FROM `users` WHERE `id` = :id LIMIT 1");
    $refetchStmt->execute([':id' => $user['id']]);
    $updatedUser = $refetchStmt->fetch();

    sendResponse(true, 'Password updated successfully! 🔐', [
        'user'  => sanitizeUser($updatedUser),
        'token' => $newToken
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to update password: ' . $e->getMessage(), null, 500);
}
