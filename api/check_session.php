<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config.php";

echo json_encode([
    "success" => true,
    "loggedIn" => isset($_SESSION["admin_id"]),
    "username" => $_SESSION["admin_username"] ?? null
]);
?>