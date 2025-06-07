import React, { useState, useEffect } from "react";
import axios from "axios";
import { Buffer } from 'buffer';


const API_UPLOAD_URL = "http://localhost/phpValidation/upload.php"; // Your actual upload URL
const API_FETCH_URL = "http://localhost/phpValidation/fetch-images.php";

interface ImageData {
  file_url: string;
  file_name: string;
}
// netlify/functions/get-image.js
interface HandlerEvent {
  queryStringParameters: {
    filename: string;
    [key: string]: string | undefined;
  };
}

interface HandlerResponse {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
  isBase64Encoded?: boolean;
}

export async function handler(event: HandlerEvent): Promise<HandlerResponse> {
  const filename = event.queryStringParameters.filename;
  const site_id = "945088f4-4c96-4a6b-a68d-5d6a5cdb49c3";
  const blob_path = "uploads";
  const token = process.env.NETLIFY_TOKEN; // Make sure this is set in Netlify env vars

  const url = `https://api.netlify.com/api/v1/blobs/${site_id}/${blob_path}/${filename}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/octet-stream",
      },
    });

    if (!response.ok) {
      return { statusCode: 404, body: "Image not found" };
    }

    // Get the image as a buffer
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
      body: Buffer.from(buffer).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error) {
    return { statusCode: 500, body: "Internal server error" };
  }
}
const ImageUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [images, setImages] = useState<ImageData[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(API_FETCH_URL, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: false, // Set to true if you need cookies
      });
      setImages(response.data.images);
    } catch (error) {
      console.error("Error fetching images", error);
      // Handle error in UI
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setUploading(true);
      const response = await axios.post(API_UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setSelectedFile(null);
        setPreviewUrl("");
        fetchImages();
      } else {
        console.error("Upload failed", response.data);
      }
    } catch (error) {
      console.error("Upload error", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Image Uploader</h2>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      {previewUrl && (
        <div style={{ marginTop: 10 }}>
          <img src={previewUrl} alt="Preview" style={{ maxHeight: 200 }} />
        </div>
      )}
      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{ marginTop: 10 }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      <hr />

      <h3>Uploaded Images</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {images.map((img, index) => (
          <div key={index} style={{ border: "1px solid #ccc", padding: 5 }}>
            <img
              src={img.file_url}
              alt={img.file_name}
              style={{ maxHeight: 100 }}
            />
            <div style={{ fontSize: 12 }}>{img.file_name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;