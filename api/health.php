<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helper.php';

try {
    $db = Database::getConnection();

    $tables = ['users', 'vehicles', 'bookings', 'cities', 'reviews', 'offers', 'tour_packages', 'contact_messages', 'vendors', 'drivers', 'guides', 'accounting_ledger'];
    $counts = [];

    foreach ($tables as $tbl) {
        try {
            $stmt = $db->query("SELECT COUNT(*) as cnt FROM `{$tbl}`");
            $row = $stmt->fetch();
            $counts[$tbl] = intval($row['cnt'] ?? 0);
        } catch (Exception $e) {
            $counts[$tbl] = 'Table not found or error';
        }
    }

    sendResponse(true, 'Siddhivinayak Tours PHP + MySQL Backend is ONLINE and healthy! 🚀', [
        'server'       => 'Apache / PHP ' . phpversion(),
        'database'     => 'siddhivinayak_tours',
        'tableRecords' => $counts,
        'timestamp'    => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Database connection failed: ' . $e->getMessage(), null, 500);
}
