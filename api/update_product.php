<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config.php";
require_once __DIR__ . "/require_admin.php";

$id          = intval($_POST["id"] ?? 0);
$name        = trim($_POST["name"] ?? "");
$desc        = trim($_POST["desc"] ?? "");
$price       = isset($_POST["price"]) ? floatval($_POST["price"]) : null;
$stock       = isset($_POST["stock"]) ? intval($_POST["stock"]) : null;
$supplier_id = isset($_POST["supplier_id"]) ? intval($_POST["supplier_id"]) : 0;

if ($id <= 0 || $name === "" || $supplier_id <= 0 || $price === null || $stock === null || $price < 0 || $stock < 0) {
    echo json_encode(["success" => false, "message" => "Please fill out all required fields correctly."]);
    exit;
}

// Handle a new photo, if one was uploaded
$newImage = null;
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
            $newImage = "uploads/" . $fileName;
        }
    }
}

if ($newImage !== null) {
    $stmt = $conn->prepare(
        "UPDATE products SET name=?, description=?, price=?, stock=?, image=?, supplier_id=? WHERE id=?"
    );
    $stmt->bind_param("ssdisii", $name, $desc, $price, $stock, $newImage, $supplier_id, $id);
} else {
    $stmt = $conn->prepare(
        "UPDATE products SET name=?, description=?, price=?, stock=?, supplier_id=? WHERE id=?"
    );
    $stmt->bind_param("ssdiii", $name, $desc, $price, $stock, $supplier_id, $id);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Product updated"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>