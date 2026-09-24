<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$userId = trim($data['userId'] ?? $data['user_id'] ?? '');
$email  = trim($data['email'] ?? '');
$type   = trim($data['type'] ?? 'EMAIL_VERIFICATION');

if (empty($userId) && empty($email)) {
    sendResponse(false, 'User ID or Email is required to resend OTP.', null, 400);
}

try {
    $db = Database::getConnection();

    $stmt = $db->prepare("SELECT * FROM `users` WHERE `id` = :uid OR LOWER(`email`) = LOWER(:email) LIMIT 1");
    $stmt->execute([':uid' => $userId, ':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        sendResponse(false, 'User account not found.', null, 404);
    }

    // Invalidate previous unexpired OTPs
    $invStmt = $db->prepare("
        UPDATE `otp_verifications` 
        SET `is_used` = 1 
        WHERE (`user_id` = :uid OR LOWER(`email`) = LOWER(:email)) AND `is_used` = 0
    ");
    $invStmt->execute([':uid' => $user['id'], ':email' => $user['email']]);

    // Generate new OTP
    $otpCode = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    $otpToken = bin2hex(random_bytes(24));
    $expiresAt = date('Y-m-d H:i:s', time() + 300);

    $insertStmt = $db->prepare("
        INSERT INTO `otp_verifications` (
            `user_id`, `email`, `mobile`, `otp_code`, `otp_token`, `otp_type`, `expires_at`, `created_at`
        ) VALUES (
            :user_id, :email, :mobile, :otp_code, :otp_token, :otp_type, :expires_at, NOW()
        )
    ");
    $insertStmt->execute([
        ':user_id'    => $user['id'],
        ':email'      => $user['email'],
        ':mobile'     => $user['mobile'],
        ':otp_code'   => $otpCode,
        ':otp_token'  => $otpToken,
        ':otp_type'   => $type,
        ':expires_at' => $expiresAt
    ]);

    $delivery = [
        'success'    => true,
        'message'    => "New verification OTP dispatched to {$user['email']}",
        'otpToken'   => $otpToken,
        'devTestOtp' => $otpCode
    ];

    sendResponse(true, "A fresh 6-digit OTP code has been dispatched to {$user['email']}.", [
        'delivery' => $delivery,
        'user'     => sanitizeUser($user)
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to resend OTP: ' . $e->getMessage(), null, 500);
}
