<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$userId      = trim($data['userId'] ?? $data['user_id'] ?? '');
$email       = trim($data['email'] ?? '');
$newPassword = trim($data['newPassword'] ?? $data['new_password'] ?? $data['password'] ?? '');

if (empty($userId) && empty($email)) {
    sendResponse(false, 'User identifier is required.', null, 400);
}

if (strlen($newPassword) < 6) {
    sendResponse(false, 'New password must be at least 6 characters long.', null, 400);
}

try {
    $db = Database::getConnection();

    $stmt = $db->prepare("SELECT * FROM `users` WHERE `id` = :uid OR LOWER(`email`) = LOWER(:email) LIMIT 1");
    $stmt->execute([':uid' => $userId, ':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        sendResponse(false, 'User not found.', null, 404);
    }

    $hashedPassword = hashUserPassword($newPassword);

    $updateStmt = $db->prepare("
        UPDATE `users` 
        SET `password` = :pass, `must_change_password` = 0, `updated_at` = NOW() 
        WHERE `id` = :id
    ");
    $updateStmt->execute([':pass' => $hashedPassword, ':id' => $user['id']]);

    // Refetch updated user
    $refetchStmt = $db->prepare("SELECT * FROM `users` WHERE `id` = :id LIMIT 1");
    $refetchStmt->execute([':id' => $user['id']]);
    $updatedUser = $refetchStmt->fetch();

    sendResponse(true, 'Password has been reset successfully! You can now login.', [
        'user' => sanitizeUser($updatedUser)
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Password reset failed: ' . $e->getMessage(), null, 500);
}
