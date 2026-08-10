<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config.php";

$sql = "SELECT id, name, email, phone FROM suppliers ORDER BY id ASC";
$result = $conn->query($sql);

$suppliers = [];
while ($row = $result->fetch_assoc()) {
    $row["id"] = (int) $row["id"];
    $suppliers[] = $row;
}

echo json_encode(["success" => true, "data" => $suppliers]);

$conn->close();
?>