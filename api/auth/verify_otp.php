<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$userId   = trim($data['userId'] ?? $data['user_id'] ?? '');
$email    = trim($data['email'] ?? '');
$otpInput = trim($data['otp'] ?? $data['otpCode'] ?? $data['otp_code'] ?? '');
$otpToken = trim($data['otpToken'] ?? $data['otp_token'] ?? '');

if (empty($otpInput) || strlen($otpInput) !== 6) {
    sendResponse(false, 'Please enter the complete 6-digit OTP code.', null, 400);
}

try {
    $db = Database::getConnection();

    // Find valid OTP record
    $query = "
        SELECT * FROM `otp_verifications` 
        WHERE (`otp_code` = :otp)
          AND `is_used` = 0
          AND `expires_at` > NOW()
    ";
    $params = [':otp' => $otpInput];

    if (!empty($otpToken)) {
        $query .= " AND `otp_token` = :token";
        $params[':token'] = $otpToken;
    } else if (!empty($userId)) {
        $query .= " AND `user_id` = :uid";
        $params[':uid'] = $userId;
    } else if (!empty($email)) {
        $query .= " AND LOWER(`email`) = LOWER(:email)";
        $params[':email'] = $email;
    }

    $query .= " ORDER BY `created_at` DESC LIMIT 1";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $otpRecord = $stmt->fetch();

    if (!$otpRecord) {
        // Increment attempts on open OTP records if any
        if (!empty($email) || !empty($userId)) {
            $attStmt = $db->prepare("
                UPDATE `otp_verifications` 
                SET `attempts` = `attempts` + 1 
                WHERE (`user_id` = :uid OR LOWER(`email`) = LOWER(:email)) AND `is_used` = 0
            ");
            $attStmt->execute([':uid' => $userId, ':email' => $email]);
        }
        sendResponse(false, 'Invalid or expired OTP code. Please verify and try again.', null, 400);
    }

    // Mark OTP as used
    $markStmt = $db->prepare("UPDATE `otp_verifications` SET `is_used` = 1 WHERE `id` = :id");
    $markStmt->execute([':id' => $otpRecord['id']]);

    // Update user status to ACTIVE and email_verified = 1
    $targetUserId = $otpRecord['user_id'] ?: $userId;
    $targetEmail  = $otpRecord['email'] ?: $email;

    $userUpdateStmt = $db->prepare("
        UPDATE `users` 
        SET `email_verified` = 1, `status` = 'ACTIVE', `updated_at` = NOW() 
        WHERE `id` = :uid OR LOWER(`email`) = LOWER(:email)
    ");
    $userUpdateStmt->execute([':uid' => $targetUserId, ':email' => $targetEmail]);

    // Fetch refreshed user record
    $userStmt = $db->prepare("SELECT * FROM `users` WHERE `id` = :uid OR LOWER(`email`) = LOWER(:email) LIMIT 1");
    $userStmt->execute([':uid' => $targetUserId, ':email' => $targetEmail]);
    $verifiedUser = $userStmt->fetch();

    if (!$verifiedUser) {
        sendResponse(false, 'User record not found.', null, 404);
    }

    $authToken = generateAuthToken($verifiedUser);

    $redirectUrl = '/user/dashboard';
    if ($verifiedUser['role'] === 'SUPER_ADMIN') {
        $redirectUrl = '/super-admin/dashboard';
    } else if ($verifiedUser['role'] === 'ADMIN') {
        $redirectUrl = '/admin/dashboard';
    }

    sendResponse(true, 'Email address verified successfully! Account is now ACTIVE. ✅', [
        'user'        => sanitizeUser($verifiedUser),
        'token'       => $authToken,
        'redirectUrl' => $redirectUrl
    ]);

} catch (Exception $e) {
    sendResponse(false, 'OTP Verification error: ' . $e->getMessage(), null, 500);
}
