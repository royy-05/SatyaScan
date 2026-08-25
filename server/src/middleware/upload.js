import multer from "multer";
import { sendError } from "../utils/responseEnvelope.js";

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and WEBP image files are allowed."));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});

export function handleUploadError(err, _req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return sendError(res, "File size exceeds maximum limit of 10MB", "FILE_TOO_LARGE", 400);
    }
    return sendError(res, `Upload error: ${err.message}`, "UPLOAD_ERROR", 400);
  } else if (err) {
    return sendError(res, err.message, "INVALID_FILE", 400);
  }
  next();
}
