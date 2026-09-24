<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$email  = trim($data['email'] ?? '');
$mobile = trim($data['mobile'] ?? '');
$type   = trim($data['type'] ?? 'EMAIL_VERIFICATION');

if (empty($email) && empty($mobile)) {
    sendResponse(false, 'Email or mobile number is required.', null, 400);
}

try {
    $db = Database::getConnection();

    $otpCode = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    $otpToken = bin2hex(random_bytes(24));
    $expiresAt = date('Y-m-d H:i:s', time() + 300);

    $insertStmt = $db->prepare("
        INSERT INTO `otp_verifications` (
            `email`, `mobile`, `otp_code`, `otp_token`, `otp_type`, `expires_at`, `created_at`
        ) VALUES (
            :email, :mobile, :otp_code, :otp_token, :otp_type, :expires_at, NOW()
        )
    ");
    $insertStmt->execute([
        ':email'      => $email,
        ':mobile'     => $mobile,
        ':otp_code'   => $otpCode,
        ':otp_token'  => $otpToken,
        ':otp_type'   => $type,
        ':expires_at' => $expiresAt
    ]);

    sendResponse(true, 'OTP dispatched successfully.', [
        'success'    => true,
        'otpToken'   => $otpToken,
        'devTestOtp' => $otpCode
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to send OTP: ' . $e->getMessage(), null, 500);
}
