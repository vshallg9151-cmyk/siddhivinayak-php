<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

try {
    $db = Database::getConnection();

    $stmt = $db->query("SELECT * FROM `reviews` WHERE `status` = 'APPROVED' ORDER BY `created_at` DESC");
    $rawReviews = $stmt->fetchAll();

    $reviews = array_map(function($r) {
        return [
            'id'        => intval($r['id']),
            'userId'    => $r['user_id'],
            'name'      => $r['user_name'],
            'city'      => $r['city'],
            'avatar'    => $r['avatar'] ?: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
            'rating'    => intval($r['rating']),
            'carUsed'   => $r['car_used'],
            'review'    => $r['review_text'],
            'tripPhoto' => $r['trip_photo'] ?: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80'
        ];
    }, $rawReviews);

    sendResponse(true, 'Customer reviews loaded successfully', [
        'reviews' => $reviews,
        'count'   => count($reviews)
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to fetch reviews: ' . $e->getMessage(), null, 500);
}
