<?php
require_once "config.php";

// CONFIG — fill these in
$site_id = 'your-netlify-site-id';
$netlify_token = 'your-netlify-access-token';
$blob_endpoint = "https://api.netlify.com/api/v1/blobs/$site_id";

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    $filename = $_FILES['image']['name'];
    $tmpPath = $_FILES['image']['tmp_name'];

    $fileData = file_get_contents($tmpPath);
    $headers = [
        "Authorization: Bearer $netlify_token",
        "Content-Type: application/octet-stream",
        "X-NF-File-Name: $filename"
    ];

    $ch = curl_init($blob_endpoint);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fileData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $res = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($res, true);
    $blobUrl = $data['url'] ?? null;

    if ($blobUrl) {
        $stmt = $pdo->prepare("INSERT INTO images (image_url) VALUES (?)");
        $stmt->execute([$blobUrl]);
        echo json_encode(["status" => "success", "url" => $blobUrl]);
    } else {
        echo json_encode(["status" => "error", "message" => "Upload to Netlify failed", "response" => $res]);
    }
}
