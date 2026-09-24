<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

try {
    $db = Database::getConnection();

    $stmt = $db->query("SELECT * FROM `offers` WHERE `is_active` = 1 ORDER BY `id` ASC");
    $rawOffers = $stmt->fetchAll();

    $offers = array_map(function($o) {
        return [
            'id'              => strtolower($o['code']),
            'code'            => $o['code'],
            'title'           => $o['title'],
            'discount'        => $o['discount'],
            'discountPercent' => intval($o['discount_percent']),
            'validity'        => $o['validity'],
            'tag'             => $o['tag'],
            'description'     => $o['description'],
            'bgGradient'      => $o['bg_gradient'],
            'minBooking'      => floatval($o['min_booking'])
        ];
    }, $rawOffers);

    sendResponse(true, 'Special offers and discount vouchers loaded', [
        'offers' => $offers,
        'count'  => count($offers)
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to fetch offers: ' . $e->getMessage(), null, 500);
}
