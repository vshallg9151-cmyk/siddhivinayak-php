<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

$data = getRequestBody();

$name        = trim($data['name'] ?? $data['customerName'] ?? '');
$email       = trim($data['email'] ?? '');
$phone       = trim($data['phone'] ?? $data['mobile'] ?? '');
$subject     = trim($data['subject'] ?? 'Trip Consultation Request');
$destination = trim($data['destination'] ?? 'Goa / Rajasthan / Custom Route');
$budget      = trim($data['budget'] ?? 'Flexible');
$travelDate  = trim($data['travelDate'] ?? $data['travel_date'] ?? date('Y-m-d'));
$travelers   = intval($data['travelers'] ?? 2);
$source      = trim($data['source'] ?? 'Website Enquiry Form');
$message     = trim($data['message'] ?? $data['notes'] ?? '');

if (empty($name) || empty($phone)) {
    sendResponse(false, 'Please provide your name and contact phone number.', null, 400);
}

try {
    $db = Database::getConnection();

    $leadId = 'lead-' . time() . '-' . rand(10, 99);

    $stmt = $db->prepare("
        INSERT INTO `contact_messages` (
            `lead_id`, `name`, `email`, `phone`, `subject`, 
            `destination`, `budget`, `travel_date`, `travelers`, 
            `source`, `message`, `status`, `assigned_staff`, `created_at`
        ) VALUES (
            :lid, :name, :email, :phone, :subj, 
            :dest, :budget, :tdate, :travelers, 
            :source, :msg, 'NEW', 'Amit Patel', NOW()
        )
    ");
    $stmt->execute([
        ':lid'       => $leadId,
        ':name'      => $name,
        ':email'     => $email,
        ':phone'     => $phone,
        ':subj'      => $subject,
        ':dest'      => $destination,
        ':budget'    => $budget,
        ':tdate'     => $travelDate,
        ':travelers' => $travelers,
        ':source'    => $source,
        ':msg'       => $message
    ]);

    sendResponse(true, 'Your travel inquiry has been received! Our tour specialist will contact you shortly.', [
        'leadId' => $leadId
    ], 201);

} catch (Exception $e) {
    sendResponse(false, 'Failed to submit enquiry: ' . $e->getMessage(), null, 500);
}
