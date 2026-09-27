<?php
/**
 * ============================================================================
 * Project: Siddhivinayak Tours & Travels
 * File: php/health.php
 
 * ============================================================================
 */

// 1. Setting JSON Header:
// Inform the client (browser, Postman, or frontend) that the response format is JSON
header('Content-Type: application/json; charset=UTF-8');

// Optional: Enable CORS headers for cross-origin demonstration requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// 2. Checking Request Method:
// Validate that incoming HTTP request uses the GET method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    // Return HTTP 405 Method Not Allowed if any other HTTP method is used (POST, PUT, DELETE, etc.)
    http_response_code(405);
    
    echo json_encode([
        "success" => false,
        "message" => "Method Not Allowed"
    ], JSON_PRETTY_PRINT);
    
    // Terminate script execution
    exit;
}

// 3. Creating Response:
// Prepare HTTP status code 200 (OK) and construct response payload array
http_response_code(200);

$response = [
    "success"    => true,
    "project"    => "Siddhivinayak Tours and Travels",
    "technology" => "PHP",
    "message"    => "PHP backend is running successfully",
    "timestamp"  => date('Y-m-d H:i:s')
];

// 4. Sending JSON Response:
// Encode the PHP associative array into a JSON formatted string and output it
echo json_encode($response, JSON_PRETTY_PRINT);
