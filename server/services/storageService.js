const fs = require('fs');
const path = require('path');

/**
 * Storage Service Abstraction
 * Handles local filesystem uploads and can easily be swapped with
 * Cloudinary or AWS S3 by toggling provider configuration.
 */
class StorageService {
  constructor() {
    this.provider = process.env.STORAGE_PROVIDER || 'local';
    this.uploadBasePath = path.join(__dirname, '..', 'uploads');

    // Ensure uploads directory structure exists
    const dirs = [
      path.join(this.uploadBasePath, 'listings'),
      path.join(this.uploadBasePath, 'profiles'),
    ];
    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Format uploaded file to listing image object
   */
  processUploadedFile(file, isMain = false) {
    if (!file) return null;

    // Normalizing local URL
    const relativePath = `/uploads/${file.fieldname === 'avatar' ? 'profiles' : 'listings'}/${file.filename}`;

    return {
      url: relativePath,
      publicId: file.filename,
      isMain: Boolean(isMain),
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Delete file from disk
   */
  deleteFile(publicId, folder = 'listings') {
    if (!publicId) return false;
    try {
      const filePath = path.join(this.uploadBasePath, folder, publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
    } catch (err) {
      console.error(`[StorageService] Failed to delete file ${publicId}:`, err.message);
    }
    return false;
  }
}

module.exports = new StorageService();
