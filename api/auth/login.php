<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$emailOrPhone = trim($data['email'] ?? $data['identifier'] ?? $data['username'] ?? '');
$password     = trim($data['password'] ?? '');

if (empty($emailOrPhone) || empty($password)) {
    sendResponse(false, 'Please provide your registered email/phone and password.', null, 400);
}

try {
    $db = Database::getConnection();

    // Clean phone if digits only
    $cleanMobile = preg_replace('/[^0-9]/', '', $emailOrPhone);
    if (strlen($cleanMobile) >= 10) {
        $cleanMobile = substr($cleanMobile, -10);
    }

    $stmt = $db->prepare("
        SELECT * FROM `users` 
        WHERE LOWER(`email`) = LOWER(:identifier) 
           OR `mobile` = :mobile 
           OR `mobile` = :rawIdent
        LIMIT 1
    ");
    $stmt->execute([
        ':identifier' => $emailOrPhone,
        ':mobile'     => $cleanMobile,
        ':rawIdent'   => $emailOrPhone
    ]);
    $user = $stmt->fetch();

    if (!$user) {
        sendResponse(false, 'Invalid email, mobile number, or password.', null, 401);
    }

    if (!verifyUserPassword($password, $user['password'])) {
        sendResponse(false, 'Invalid email, mobile number, or password.', null, 401);
    }

    if ($user['status'] === 'DISABLED') {
        sendResponse(false, 'Your account has been deactivated. Please contact the Super Admin.', null, 403);
    }

    if (!$user['email_verified']) {
        sendResponse(false, 'Please verify your email address to continue.', [
            'unverifiedUser'   => sanitizeUser($user),
            'requiresVerification' => true
        ], 403);
    }

    $token = generateAuthToken($user);

    // Update auth token & last login in db
    $updateStmt = $db->prepare("UPDATE `users` SET `auth_token` = :token, `updated_at` = NOW() WHERE `id` = :id");
    $updateStmt->execute([':token' => $token, ':id' => $user['id']]);

    $redirectUrl = '/user/dashboard';
    if ($user['role'] === 'SUPER_ADMIN') {
        $redirectUrl = '/super-admin/dashboard';
    } else if ($user['role'] === 'ADMIN') {
        $redirectUrl = '/admin/dashboard';
    }

    sendResponse(true, 'Login successful! Welcome back ' . $user['name'], [
        'user'        => sanitizeUser($user),
        'token'       => $token,
        'redirectUrl' => $redirectUrl
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Server error during authentication: ' . $e->getMessage(), null, 500);
}
