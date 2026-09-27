<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

try {
    $db = Database::getConnection();
    $admin = requireAdminRole($db);

    $search = trim($_GET['search'] ?? '');
    $role   = trim($_GET['role'] ?? '');
    $status = trim($_GET['status'] ?? '');

    $query = "SELECT * FROM `users` WHERE 1=1";
    $params = [];

    if (!empty($search)) {
        $query .= " AND (`name` LIKE :search OR `email` LIKE :search OR `mobile` LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    if (!empty($role) && $role !== 'ALL') {
        $query .= " AND `role` = :role";
        $params[':role'] = strtoupper($role);
    }

    if (!empty($status) && $status !== 'ALL') {
        $query .= " AND `status` = :status";
        $params[':status'] = strtoupper($status);
    }

    $query .= " ORDER BY `created_at` DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $users = $stmt->fetchAll();

    $sanitized = array_map('sanitizeUser', $users);

    sendResponse(true, 'Users list fetched successfully', [
        'users' => $sanitized,
        'total' => count($sanitized)
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to fetch users: ' . $e->getMessage(), null, 500);
}
