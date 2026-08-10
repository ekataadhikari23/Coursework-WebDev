<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config.php";
require_once __DIR__ . "/require_admin.php";

$input = json_decode(file_get_contents("php://input"), true);
$name  = trim($input["name"] ?? "");
$email = trim($input["email"] ?? "");
$phone = trim($input["phone"] ?? "");

if ($name === "" || $email === "" || $phone === "") {
    echo json_encode(["success" => false, "message" => "Please complete all supplier details."]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO suppliers (name, email, phone) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $name, $email, $phone);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Supplier added", "id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>