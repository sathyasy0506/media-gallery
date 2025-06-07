<?php
require_once "config.php";
$stmt = $pdo->query("SELECT image_url FROM images ORDER BY uploaded_at DESC");
$images = $stmt->fetchAll(PDO::FETCH_COLUMN);
echo json_encode(["images" => $images]);
