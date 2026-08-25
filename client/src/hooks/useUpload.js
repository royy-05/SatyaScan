import { useState } from "react";
import { apiClient } from "../api/client";

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadDocument = async (file, docType, idempotencyKey = null) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", docType);

    const headers = {
      "Content-Type": "multipart/form-data",
    };

    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    try {
      const res = await apiClient.post("/documents", formData, {
        headers,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
      });

      setUploading(false);
      return res.data;
    } catch (err) {
      setUploading(false);
      setError(err.message || "Upload failed");
      throw err;
    }
  };

  return { uploadDocument, uploading, progress, error };
}
