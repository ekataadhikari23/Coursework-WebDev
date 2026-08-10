<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config.php";

$sql = "SELECT p.id, p.name, p.description AS `desc`, p.price, p.stock, p.image,
               p.supplier_id, s.name AS supplier
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        ORDER BY p.id DESC";

$result = $conn->query($sql);

$products = [];
while ($row = $result->fetch_assoc()) {
    $row["price"] = (float) $row["price"];
    $row["stock"] = (int) $row["stock"];
    $row["supplier_id"] = $row["supplier_id"] !== null ? (int) $row["supplier_id"] : null;
    $products[] = $row;
}

echo json_encode(["success" => true, "data" => $products]);

$conn->close();
?>