<?php
if (!isset($_SESSION["admin_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "You must be logged in as admin to do this."]);
    exit;
}
?>