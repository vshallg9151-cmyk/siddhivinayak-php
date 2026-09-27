<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$name         = trim($data['name'] ?? '');
$email        = trim($data['email'] ?? '');
$mobile       = trim($data['mobile'] ?? '');
$tempPassword = trim($data['tempPassword'] ?? $data['password'] ?? 'Admin@2026');

if (empty($name) || strlen($name) < 2) {
    sendResponse(false, 'Admin full name is required.', null, 400);
}

$emailVal = validateEmail($email);
if (!$emailVal['valid']) {
    sendResponse(false, $emailVal['error'], null, 400);
}
$cleanEmail = $emailVal['cleanEmail'];

$mobileVal = validateIndianMobile($mobile);
if (!$mobileVal['valid']) {
    sendResponse(false, $mobileVal['error'], null, 400);
}
$cleanMobile = $mobileVal['cleanMobile'];

try {
    $db = Database::getConnection();
    $superAdmin = requireSuperAdminRole($db);

    // Check email uniqueness
    $checkStmt = $db->prepare("SELECT `id` FROM `users` WHERE LOWER(`email`) = LOWER(:email) LIMIT 1");
    $checkStmt->execute([':email' => $cleanEmail]);
    if ($checkStmt->fetch()) {
        sendResponse(false, 'An account with this email address already exists.', null, 409);
    }

    $adminId = 'admin-' . time() . '-' . rand(100, 999);
    $hashedPassword = hashUserPassword($tempPassword);

    $insertStmt = $db->prepare("
        INSERT INTO `users` (
            `id`, `name`, `email`, `mobile`, `password`, 
            `role`, `status`, `is_owner`, `email_verified`, 
            `mobile_verified`, `must_change_password`, `created_at`
        ) VALUES (
            :id, :name, :email, :mobile, :password, 
            'ADMIN', 'ACTIVE', 0, 1, 
            1, 1, NOW()
        )
    ");
    $insertStmt->execute([
        ':id'       => $adminId,
        ':name'     => $name,
        ':email'    => $cleanEmail,
        ':mobile'   => $cleanMobile,
        ':password' => $hashedPassword
    ]);

    $newAdmin = [
        'id'                 => $adminId,
        'name'               => $name,
        'email'              => $cleanEmail,
        'mobile'             => $cleanMobile,
        'role'               => 'ADMIN',
        'status'             => 'ACTIVE',
        'isOwner'            => false,
        'emailVerified'      => true,
        'mobileVerified'     => true,
        'mustChangePassword' => true,
        'tempPassword'       => $tempPassword
    ];

    sendResponse(true, "Admin account for '{$name}' created successfully.", [
        'admin' => $newAdmin
    ], 201);

} catch (Exception $e) {
    sendResponse(false, 'Failed to create admin account: ' . $e->getMessage(), null, 500);
}
