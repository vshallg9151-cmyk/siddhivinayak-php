<?php
/**
 * Utility Helpers & Security Methods
 * Siddhivinayak Tours & Travels - PHP API Layer
 */

require_once __DIR__ . '/database.php';

/**
 * Standardized JSON API Response
 */
function sendResponse($success, $message = '', $data = null, $statusCode = 200, $extra = []) {
    http_response_code($statusCode);
    
    $response = [
        'success' => (bool)$success,
        'message' => $message,
        'data'    => $data
    ];

    if (!empty($extra)) {
        foreach ($extra as $key => $val) {
            $response[$key] = $val;
        }
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Parse JSON Request Body or POST Data
 */
function getRequestBody() {
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $decoded = json_decode($rawInput, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }
    }
    return !empty($_POST) ? $_POST : [];
}

/**
 * Hash Password using standard PHP password_hash (BCrypt)
 */
function hashUserPassword($plainPassword) {
    return password_hash($plainPassword, PASSWORD_BCRYPT, ['cost' => 10]);
}

/**
 * Verify Password using password_verify with fallback for known seed passwords
 */
function verifyUserPassword($plainPassword, $hashOrStored) {
    if (empty($plainPassword) || empty($hashOrStored)) {
        return false;
    }

    // Standard PHP verification
    if (password_verify($plainPassword, $hashOrStored)) {
        return true;
    }

    // Predefined Test Account fallbacks for initial testing before password reset
    if ($plainPassword === 'siddhi@2005' && strpos($hashOrStored, 'd6BwT2k1gRzS4yP') !== false) return true;
    if ($plainPassword === 'admin123' && strpos($hashOrStored, 'e7CwU3l2hSaT5zQ') !== false) return true;
    if ($plainPassword === 'user123' && strpos($hashOrStored, 'f8DxV4m3iTbU6aR') !== false) return true;
    
    // Direct plain match in development if plain stored
    if ($plainPassword === $hashOrStored) {
        return true;
    }

    return false;
}

/**
 * Sanitize User Object (Strip sensitive columns like password)
 */
function sanitizeUser($user) {
    if (!$user) return null;
    unset($user['password']);
    
    // Ensure boolean conversions
    $user['isOwner'] = (bool)($user['is_owner'] ?? $user['isOwner'] ?? false);
    $user['emailVerified'] = (bool)($user['email_verified'] ?? $user['emailVerified'] ?? false);
    $user['mobileVerified'] = (bool)($user['mobile_verified'] ?? $user['mobileVerified'] ?? true);
    $user['mustChangePassword'] = (bool)($user['must_change_password'] ?? $user['mustChangePassword'] ?? false);
    
    return $user;
}

/**
 * Generate Secure Session / Auth Token
 */
function generateAuthToken($user) {
    $payload = [
        'id'    => $user['id'],
        'email' => $user['email'],
        'role'  => $user['role'],
        'time'  => time(),
        'rand'  => bin2hex(random_bytes(16))
    ];
    return base64_encode(json_encode($payload));
}

/**
 * Extract Authenticated User from Request Header
 */
function getAuthenticatedUser($db) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    
    if (empty($authHeader) && function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (empty($authHeader) && isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        $authHeader = 'Bearer ' . $_SERVER['HTTP_X_AUTH_TOKEN'];
    }

    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }

    $token = trim($matches[1]);
    try {
        $json = base64_decode($token);
        $payload = json_decode($json, true);
        if (!$payload || !isset($payload['id'])) {
            return null;
        }

        $stmt = $db->prepare("SELECT * FROM `users` WHERE `id` = :id LIMIT 1");
        $stmt->execute([':id' => $payload['id']]);
        $user = $stmt->fetch();

        if ($user && $user['status'] === 'ACTIVE') {
            return $user;
        }
        return null;
    } catch (Exception $e) {
        return null;
    }
}

/**
 * Require valid authenticated user
 */
function requireAuthUser($db) {
    $user = getAuthenticatedUser($db);
    if (!$user) {
        sendResponse(false, 'Authentication required. Please log in.', null, 401);
    }
    return $user;
}

/**
 * Require ADMIN or SUPER_ADMIN role
 */
function requireAdminRole($db) {
    $user = requireAuthUser($db);
    if (!in_array($user['role'], ['ADMIN', 'SUPER_ADMIN'])) {
        sendResponse(false, 'Access denied. Administrator privileges required.', null, 403);
    }
    return $user;
}

/**
 * Require SUPER_ADMIN role specifically
 */
function requireSuperAdminRole($db) {
    $user = requireAuthUser($db);
    if ($user['role'] !== 'SUPER_ADMIN') {
        sendResponse(false, 'Access denied. Super Administrator privileges required.', null, 403);
    }
    return $user;
}

/**
 * Validate Indian 10-Digit Mobile Number
 */
function validateIndianMobile($mobile) {
    $clean = preg_replace('/[^0-9]/', '', (string)$mobile);
    $clean = substr($clean, -10);
    
    if (strlen($clean) !== 10) {
        return ['valid' => false, 'error' => 'Mobile number must be exactly 10 digits.'];
    }
    if (!in_array($clean[0], ['6', '7', '8', '9'])) {
        return ['valid' => false, 'error' => 'Indian mobile numbers must start with 6, 7, 8, or 9.'];
    }
    return ['valid' => true, 'cleanMobile' => $clean];
}

/**
 * Validate Email Address
 */
function validateEmail($email) {
    $clean = strtolower(trim((string)$email));
    if (!filter_var($clean, FILTER_VALIDATE_EMAIL)) {
        return ['valid' => false, 'error' => 'Please enter a valid email address.'];
    }
    return ['valid' => true, 'cleanEmail' => $clean];
}
