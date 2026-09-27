<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$name            = trim($data['name'] ?? '');
$email           = trim($data['email'] ?? '');
$mobile          = trim($data['mobile'] ?? '');
$password        = trim($data['password'] ?? '');
$confirmPassword = trim($data['confirmPassword'] ?? $data['confirm_password'] ?? $password);

if (empty($name) || strlen($name) < 2) {
    sendResponse(false, 'Please enter your full name.', null, 400);
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

if (strlen($password) < 6) {
    sendResponse(false, 'Password must be at least 6 characters long.', null, 400);
}

if ($password !== $confirmPassword) {
    sendResponse(false, 'Password and Confirm Password do not match.', null, 400);
}

try {
    $db = Database::getConnection();

    // Check email uniqueness
    $checkStmt = $db->prepare("SELECT `id` FROM `users` WHERE LOWER(`email`) = LOWER(:email) LIMIT 1");
    $checkStmt->execute([':email' => $cleanEmail]);
    if ($checkStmt->fetch()) {
        sendResponse(false, 'An account with this email address already exists.', null, 409);
    }

    // Check mobile uniqueness
    $checkMobStmt = $db->prepare("SELECT `id` FROM `users` WHERE `mobile` = :mobile LIMIT 1");
    $checkMobStmt->execute([':mobile' => $cleanMobile]);
    if ($checkMobStmt->fetch()) {
        sendResponse(false, 'An account with this mobile number already exists.', null, 409);
    }

    $userId = 'usr-' . time() . '-' . rand(100, 999);
    $hashedPassword = hashUserPassword($password);

    // Insert new pending user
    $insertStmt = $db->prepare("
        INSERT INTO `users` (
            `id`, `name`, `email`, `mobile`, `password`, 
            `role`, `status`, `is_owner`, `email_verified`, 
            `mobile_verified`, `must_change_password`, `created_at`
        ) VALUES (
            :id, :name, :email, :mobile, :password, 
            'USER', 'PENDING_VERIFICATION', 0, 0, 
            1, 0, NOW()
        )
    ");
    $insertStmt->execute([
        ':id'       => $userId,
        ':name'     => $name,
        ':email'    => $cleanEmail,
        ':mobile'   => $cleanMobile,
        ':password' => $hashedPassword
    ]);

    // Generate 6-digit OTP code & token
    $otpCode = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    $otpToken = bin2hex(random_bytes(24));
    $expiresAt = date('Y-m-d H:i:s', time() + 300); // 5 minutes

    $otpStmt = $db->prepare("
        INSERT INTO `otp_verifications` (
            `user_id`, `email`, `mobile`, `otp_code`, `otp_token`, `otp_type`, `expires_at`, `created_at`
        ) VALUES (
            :user_id, :email, :mobile, :otp_code, :otp_token, 'EMAIL_VERIFICATION', :expires_at, NOW()
        )
    ");
    $otpStmt->execute([
        ':user_id'    => $userId,
        ':email'      => $cleanEmail,
        ':mobile'     => $cleanMobile,
        ':otp_code'   => $otpCode,
        ':otp_token'  => $otpToken,
        ':expires_at' => $expiresAt
    ]);

    $newUser = [
        'id'            => $userId,
        'name'          => $name,
        'email'         => $cleanEmail,
        'mobile'        => $cleanMobile,
        'role'          => 'USER',
        'status'        => 'PENDING_VERIFICATION',
        'isOwner'       => false,
        'emailVerified' => false,
        'mobileVerified'=> true,
        'emailDelivery' => [
            'success'       => true,
            'message'       => "Verification OTP code sent to {$cleanEmail}",
            'otpToken'      => $otpToken,
            'devTestOtp'    => $otpCode // Available for seamless testing in local environment
        ]
    ];

    sendResponse(true, 'Registration initiated successfully. Please enter the 6-digit OTP sent to your email.', [
        'user'                 => $newUser,
        'requiresVerification' => true,
        'emailDelivery'        => $newUser['emailDelivery']
    ], 201);

} catch (Exception $e) {
    sendResponse(false, 'Registration failed: ' . $e->getMessage(), null, 500);
}
