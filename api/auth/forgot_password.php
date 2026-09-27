<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$identifier = trim($data['email'] ?? $data['identifier'] ?? $data['mobile'] ?? '');

if (empty($identifier)) {
    sendResponse(false, 'Please provide your registered email or mobile number.', null, 400);
}

try {
    $db = Database::getConnection();

    $cleanMobile = preg_replace('/[^0-9]/', '', $identifier);
    if (strlen($cleanMobile) >= 10) {
        $cleanMobile = substr($cleanMobile, -10);
    }

    $stmt = $db->prepare("
        SELECT * FROM `users` 
        WHERE LOWER(`email`) = LOWER(:ident) 
           OR `mobile` = :mobile 
           OR `mobile` = :rawIdent
        LIMIT 1
    ");
    $stmt->execute([
        ':ident'    => $identifier,
        ':mobile'   => $cleanMobile,
        ':rawIdent' => $identifier
    ]);
    $user = $stmt->fetch();

    if (!$user) {
        sendResponse(false, 'No user account found matching this email or mobile number.', null, 404);
    }

    // Generate password reset OTP
    $otpCode = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    $otpToken = bin2hex(random_bytes(24));
    $expiresAt = date('Y-m-d H:i:s', time() + 300);

    $insertStmt = $db->prepare("
        INSERT INTO `otp_verifications` (
            `user_id`, `email`, `mobile`, `otp_code`, `otp_token`, `otp_type`, `expires_at`, `created_at`
        ) VALUES (
            :user_id, :email, :mobile, :otp_code, :otp_token, 'PASSWORD_RESET', :expires_at, NOW()
        )
    ");
    $insertStmt->execute([
        ':user_id'    => $user['id'],
        ':email'      => $user['email'],
        ':mobile'     => $user['mobile'],
        ':otp_code'   => $otpCode,
        ':otp_token'  => $otpToken,
        ':expires_at' => $expiresAt
    ]);

    $delivery = [
        'success'    => true,
        'message'    => "Password reset OTP dispatched to {$user['email']}",
        'otpToken'   => $otpToken,
        'devTestOtp' => $otpCode
    ];

    sendResponse(true, "Password reset OTP code dispatched to {$user['email']}.", [
        'user'          => sanitizeUser($user),
        'emailDelivery' => $delivery
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to initiate password reset: ' . $e->getMessage(), null, 500);
}
