<?php
//does not load require_admin.php because viewing my suppliers isn't restricted
header("Content-Type: application/json");
require_once __DIR__ . "/../config.php";

// grabs suppliers from the table sorted by is old to new
$sql = "SELECT id, name, email, phone FROM suppliers ORDER BY id ASC";
$result = $conn->query($sql);

//loops through each supplier rows ata time and adds in PHP list
$suppliers = [];
while ($row = $result->fetch_assoc()) {
    $row["id"] = (int) $row["id"]; //makes sure id comes out asactual number not text
    $suppliers[] = $row;
}

echo json_encode(["success" => true, "data" => $suppliers]);

$conn->close();
?>