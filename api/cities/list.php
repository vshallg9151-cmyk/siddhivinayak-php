<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

try {
    $db = Database::getConnection();

    $popular = isset($_GET['popular']) ? (bool)$_GET['popular'] : false;
    $search  = trim($_GET['search'] ?? $_GET['query'] ?? '');
    $all     = isset($_GET['all']) ? (bool)$_GET['all'] : false;

    $query = "SELECT * FROM `cities` WHERE 1=1";
    $params = [];

    if (!$all) {
        $query .= " AND `status` != 'DISABLED'";
    }

    if ($popular) {
        $query .= " AND `popular` = 1";
    }

    if (!empty($search)) {
        $query .= " AND (`name` LIKE :search OR `district` LIKE :search OR `state` LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    $query .= " ORDER BY `popular` DESC, `name` ASC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $cities = $stmt->fetchAll();

    $formatted = array_map(function($c) {
        return [
            'id'       => $c['id'],
            'name'     => $c['name'],
            'district' => $c['district'],
            'state'    => $c['state'],
            'popular'  => (bool)$c['popular'],
            'isPopular'=> (bool)$c['popular'],
            'status'   => $c['status'],
            'badge'    => (bool)$c['popular'] ? 'Popular Hub' : null
        ];
    }, $cities);

    sendResponse(true, 'Cities fetched successfully', [
        'cities' => $formatted,
        'count'  => count($formatted)
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to fetch cities: ' . $e->getMessage(), null, 500);
}
