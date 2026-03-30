import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');

// Store file locally (no S3 configured)
export const handleFileUpload = async (file, folder) => {
  const destDir = path.join(process.cwd(), 'uploads', folder);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const filename = `${Date.now()}-${file.originalname}`;
  const destPath = path.join(destDir, filename);
  fs.renameSync(file.path, destPath);

  return { filename };
};

// Return local file path info
export const getFileLocation = async (filename, localDir) => {
  return {
    isS3: false,
    localPath: path.join(localDir, filename),
  };
};

// Delete file from local storage
export const deleteFile = async (filename, localDir) => {
  const filePath = path.join(localDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
