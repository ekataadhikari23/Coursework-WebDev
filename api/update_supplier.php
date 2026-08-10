<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config.php";
require_once __DIR__ . "/require_admin.php";

$input = json_decode(file_get_contents("php://input"), true);
$id    = intval($input["id"] ?? 0);
$name  = trim($input["name"] ?? "");
$email = trim($input["email"] ?? "");
$phone = trim($input["phone"] ?? "");

if ($id <= 0 || $name === "" || $email === "" || $phone === "") {
    echo json_encode(["success" => false, "message" => "Please complete all supplier details."]);
    exit;
}

$stmt = $conn->prepare("UPDATE suppliers SET name=?, email=?, phone=? WHERE id=?");
$stmt->bind_param("sssi", $name, $email, $phone, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Supplier updated"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>