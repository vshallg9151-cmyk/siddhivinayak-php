<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

try {
    $db = Database::getConnection();
    $admin = requireAdminRole($db);

    $status = strtoupper(trim($_GET['status'] ?? ''));

    $query = "SELECT * FROM `contact_messages` WHERE 1=1";
    $params = [];

    if (!empty($status) && $status !== 'ALL') {
        $query .= " AND `status` = :status";
        $params[':status'] = $status;
    }

    $query .= " ORDER BY `created_at` DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $rawMessages = $stmt->fetchAll();

    $leads = array_map(function($m) {
        return [
            'id'            => $m['lead_id'] ?: ('lead-' . $m['id']),
            'customerName'  => $m['name'],
            'phone'         => $m['phone'],
            'email'         => $m['email'],
            'destination'   => $m['destination'],
            'budget'        => $m['budget'],
            'travelDate'    => $m['travel_date'],
            'travelers'     => intval($m['travelers']),
            'source'        => $m['source'],
            'status'        => $m['status'],
            'assignedStaff' => $m['assigned_staff'],
            'notes'         => $m['message'] ?: $m['notes']
        ];
    }, $rawMessages);

    sendResponse(true, 'CRM inquiries fetched successfully', [
        'leads' => $leads,
        'count' => count($leads)
    ]);

} catch (Exception $e) {
    sendResponse(false, 'Failed to fetch enquiries: ' . $e->getMessage(), null, 500);
}
