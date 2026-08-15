<?php
$db_host = "sql201.infinityfree.com";   
$db_name = "if0_42661679_webdb"; 
$db_user = "if0_42661679";  
$db_pass = "0krVvN9qcd88U";

// prevents a PHP error that happens if we try to start a session that’s already running 
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit;
}

$conn->set_charset("utf8mb4");
?>