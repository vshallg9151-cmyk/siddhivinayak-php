<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

try {
    $db = Database::getConnection();

    $stmt = $db->query("SELECT * FROM `tour_packages` WHERE `is_active` = 1 ORDER BY `price_per_person` ASC");
    $rawPackages = $stmt->fetchAll();

    $packages = array_map(function($p) {
        $itinerary = json_decode($p['itinerary'] ?? '[]', true) ?: [];
        $inclusions = json_decode($p['inclusions'] ?? '[]', true) ?: [];
        $exclusions = json_decode($p['exclusions'] ?? '[]', true) ?: [];
        $gallery = json_decode($p['gallery'] ?? '[]', true) ?: [$p['image']];

        return [
            'id'                => $p['id'],
            'title'             => $p['title'],
            'destination'       => $p['destination'],
            'duration'          => $p['duration'],
            'nights'            => intval($p['nights']),
            'days'              => intval($p['days']),
            'category'          => $p['category'],
            'badge'             => $p['badge'],
            'image'             => $p['image'],
            'gallery'           => $gallery,
            'pricePerPerson'    => floatval($p['price_per_person']),
            'originalPrice'     => floatval($p['original_price']),
            'discountPercent'   => intval($p['discount_percent']),
            'rating'            => floatval($p['rating']),
            'reviewsCount'      => intval($p['reviews_count']),
            'hotelCategory'     => $p['hotel_category'],
            'includedTransport' => $p['included_transport'],
            'mealPlan'          => $p['meal_plan'],
            'itinerary'         => $itinerary,
            'inclusions'        => $inclusions,
            'exclusions'        => $exclusions,
            'policies'          => $p['policies']
        ];
    }, $rawPackages);

    sendResponse(true, 'Tour packages loaded successfully', [
        'packages' => $packages,
        'count'    => count($packages)
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to fetch packages: ' . $e->getMessage(), null, 500);
}
