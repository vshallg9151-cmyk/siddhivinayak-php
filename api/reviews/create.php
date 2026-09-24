<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();
$name       = trim($data['name'] ?? $data['userName'] ?? '');
$city       = trim($data['city'] ?? 'Mumbai');
$rating     = intval($data['rating'] ?? 5);
$carUsed    = trim($data['carUsed'] ?? $data['car_used'] ?? 'Mahindra Thar 4x4');
$reviewText = trim($data['review'] ?? $data['reviewText'] ?? $data['review_text'] ?? '');
$userId     = trim($data['userId'] ?? $data['user_id'] ?? '');
$avatar     = trim($data['avatar'] ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80');

if (empty($name) || empty($reviewText)) {
    sendResponse(false, 'Customer name and review feedback are required.', null, 400);
}

try {
    $db = Database::getConnection();

    $stmt = $db->prepare("
        INSERT INTO `reviews` (`user_id`, `user_name`, `city`, `avatar`, `rating`, `car_used`, `review_text`, `status`, `created_at`)
        VALUES (:uid, :uname, :city, :avatar, :rating, :car, :rtext, 'APPROVED', NOW())
    ");
    $stmt->execute([
        ':uid'    => $userId ?: null,
        ':uname'  => $name,
        ':city'   => $city,
        ':avatar' => $avatar,
        ':rating' => max(1, min(5, $rating)),
        ':car'    => $carUsed,
        ':rtext'  => $reviewText
    ]);

    sendResponse(true, 'Thank you! Your verified review has been published.', [
        'id' => $db->lastInsertId()
    ], 201);

} catch (Exception $e) {
    sendResponse(false, 'Failed to submit review: ' . $e->getMessage(), null, 500);
}
