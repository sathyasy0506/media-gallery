<?php
require_once '../config.php';

header('Content-Type: application/json');

$sql = "SELECT * FROM media ORDER BY created_at DESC";
$result = $conn->query($sql);

$mediaItems = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Construct the URL to the blob on Netlify
        $row['blob_url'] = "https://blobs.netlifyusercontent.com/" . NETLIFY_SITE_ID . "/" . $row['blob_key'];
        $mediaItems[] = $row;
    }
}

echo json_encode($mediaItems);
