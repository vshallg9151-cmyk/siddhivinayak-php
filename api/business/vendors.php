<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

$method = $_SERVER['REQUEST_METHOD'];
$data   = getRequestBody();
$action = trim($_GET['action'] ?? $data['action'] ?? '');

try {
    $db = Database::getConnection();
    $admin = requireAdminRole($db);

    if ($method === 'DELETE' || $action === 'delete') {
        $vendorId = trim($data['id'] ?? $_GET['id'] ?? '');
        if (empty($vendorId)) {
            sendResponse(false, 'Vendor ID is required.', null, 400);
        }
        $stmt = $db->prepare("DELETE FROM `vendors` WHERE `id` = :id");
        $stmt->execute([':id' => $vendorId]);
        sendResponse(true, 'Vendor deleted successfully.');
    }

    $companyName   = trim($data['companyName'] ?? $data['company_name'] ?? '');
    $contactPerson = trim($data['contactPerson'] ?? $data['contact_person'] ?? '');
    $phone         = trim($data['phone'] ?? '');
    $email         = trim($data['email'] ?? '');
    $category      = trim($data['category'] ?? 'Hotel Partner');
    $location      = trim($data['location'] ?? 'Surat');
    $services      = trim($data['services'] ?? 'Luxury Stays');
    $pricing       = trim($data['pricing'] ?? '₹5,000 / night');

    if (empty($companyName) || empty($phone)) {
        sendResponse(false, 'Company Name and Contact Phone are required.', null, 400);
    }

    $newId = 'vnd-' . time() . '-' . rand(10, 99);
    $insStmt = $db->prepare("
        INSERT INTO `vendors` (
            `id`, `company_name`, `contact_person`, `phone`, `email`, 
            `category`, `location`, `services`, `pricing`, `contract_status`, `rating`, `created_at`
        ) VALUES (
            :id, :cname, :cperson, :phone, :email, 
            :cat, :loc, :srv, :price, 'Active Contract (15% Commission)', 4.90, NOW()
        )
    ");
    $insStmt->execute([
        ':id'      => $newId,
        ':cname'   => $companyName,
        ':cperson' => $contactPerson,
        ':phone'   => $phone,
        ':email'   => $email,
        ':cat'     => $category,
        ':loc'     => $location,
        ':srv'     => $services,
        ':price'   => $pricing
    ]);

    sendResponse(true, "Vendor '{$companyName}' registered successfully.", [
        'vendor' => [
            'id'             => $newId,
            'companyName'    => $companyName,
            'contactPerson'  => $contactPerson,
            'phone'          => $phone,
            'email'          => $email,
            'category'       => $category,
            'location'       => $location,
            'services'       => $services,
            'pricing'        => $pricing,
            'contractStatus' => 'Active Contract (15% Commission)',
            'rating'         => 4.90
        ]
    ], 201);

} catch (Exception $e) {
    sendResponse(false, 'Vendor operation failed: ' . $e->getMessage(), null, 500);
}
