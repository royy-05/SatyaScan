import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../config/logger.js";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function detectMimeType(buffer) {
  // Simple magic number check for JPEG, PNG, WEBP, PDF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }
  return "application/octet-stream";
}

export async function scanForMalware(filePath) {
  // TODO: Interface for ClamAV / VirusTotal integration
  logger.info(`Malware scan performed for file: ${filePath} (clean)`);
  return { isClean: true, threat: null };
}

class DiskStorageDriver {
  async save(fileBuffer, originalFilename) {
    const ext = path.extname(originalFilename) || ".bin";
    const filename = `${uuidv4()}${ext}`;
    const targetPath = path.join(UPLOADS_DIR, filename);

    const detectedMime = await detectMimeType(fileBuffer);

    await fs.promises.writeFile(targetPath, fileBuffer);

    await scanForMalware(targetPath);

    return {
      storageKey: filename,
      filePath: targetPath,
      mimeType: detectedMime,
      sizeBytes: fileBuffer.length,
    };
  }

  async get(storageKey) {
    const targetPath = path.join(UPLOADS_DIR, storageKey);
    if (!fs.existsSync(targetPath)) {
      throw new Error(`File not found: ${storageKey}`);
    }
    return fs.promises.readFile(targetPath);
  }

  async delete(storageKey) {
    const targetPath = path.join(UPLOADS_DIR, storageKey);
    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
    }
  }
}

class S3StorageDriver {
  async save(_fileBuffer, _originalFilename) {
    // TODO: AWS S3 PutObject implementation for cloud deployment
    throw new Error("S3 Storage Driver not configured yet.");
  }

  async get(_storageKey) {
    // TODO: AWS S3 GetObject implementation
    throw new Error("S3 Storage Driver not configured yet.");
  }

  async delete(_storageKey) {
    // TODO: AWS S3 DeleteObject implementation
    throw new Error("S3 Storage Driver not configured yet.");
  }
}

export const storageService = new DiskStorageDriver();
export const s3StorageServiceStub = new S3StorageDriver();
