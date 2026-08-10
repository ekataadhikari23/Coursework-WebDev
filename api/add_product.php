<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config.php";
require_once __DIR__ . "/require_admin.php";

$name        = trim($_POST["name"] ?? "");
$desc        = trim($_POST["desc"] ?? "");
$price       = isset($_POST["price"]) ? floatval($_POST["price"]) : null;
$stock       = isset($_POST["stock"]) ? intval($_POST["stock"]) : null;
$supplier_id = isset($_POST["supplier_id"]) ? intval($_POST["supplier_id"]) : 0;

if ($name === "" || $supplier_id <= 0 || $price === null || $stock === null || $price < 0 || $stock < 0) {
    echo json_encode(["success" => false, "message" => "Please fill out all required fields correctly."]);
    exit;
}

// Default image if none uploaded
$imagePath = "BerryTotebag.webp";

if (isset($_FILES["photo"]) && $_FILES["photo"]["error"] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . "/../uploads/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $allowed = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
    $ext = strtolower(pathinfo($_FILES["photo"]["name"], PATHINFO_EXTENSION));

    if (in_array($ext, $allowed)) {
        $fileName = uniqid("prod_", true) . "." . $ext;
        $targetPath = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES["photo"]["tmp_name"], $targetPath)) {
            $imagePath = "uploads/" . $fileName;
        }
    }
}

$stmt = $conn->prepare(
    "INSERT INTO products (name, description, price, stock, image, supplier_id)
     VALUES (?, ?, ?, ?, ?, ?)"
);
$stmt->bind_param("ssdisi", $name, $desc, $price, $stock, $imagePath, $supplier_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Product added", "id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>