<?php
$db_host = "localhost";
$db_name = "ekata_webdb";
$db_user = "root";
$db_pass = "";

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