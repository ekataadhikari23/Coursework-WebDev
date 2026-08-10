<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config.php";

$input = json_decode(file_get_contents("php://input"), true);
$username = trim($input["username"] ?? "");
$password = trim($input["password"] ?? "");

if ($username === "" || $password === "") {
    echo json_encode(["success" => false, "message" => "Please enter a username and password."]);
    exit;
}

$stmt = $conn->prepare("SELECT id, username, password FROM admins WHERE username = ? LIMIT 1");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $admin = $result->fetch_assoc();

    if (password_verify($password, $admin["password"])) {
        $_SESSION["admin_id"] = $admin["id"];
        $_SESSION["admin_username"] = $admin["username"];
        echo json_encode(["success" => true, "message" => "Login successful"]);
    } else {
        echo json_encode(["success" => false, "message" => "Wrong username or password. Try admin / admin123"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Wrong username or password. Try admin / admin123"]);
}

$stmt->close();
$conn->close();
?>