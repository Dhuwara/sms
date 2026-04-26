import path from 'node:path';
import fs from 'node:fs';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const isS3Enabled = () =>
  !!(process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

const getS3Client = () =>
  new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

/**
 * Upload a file to S3 or local disk.
 * @param {Express.Multer.File} file  – multer file object
 * @param {string}              folder – destination folder name (e.g. 'documents')
 * @returns {{ filename: string }}
 */
export const handleFileUpload = async (file, folder) => {
  const filename = `${Date.now()}-${file.originalname}`;

  if (isS3Enabled()) {
    const client = getS3Client();
    const key = `${folder}/${filename}`;

    const fileBuffer = fs.readFileSync(file.path);
    await client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: file.mimetype,
    }));

    // Remove the temp file multer wrote to disk
    fs.unlinkSync(file.path);
    return { filename: key };
  }

  // Local fallback
  const destDir = path.join(process.cwd(), 'uploads', folder);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const destPath = path.join(destDir, filename);
  fs.renameSync(file.path, destPath);
  return { filename };
};

/**
 * Resolve a stored filename to a signed S3 URL or a local file path.
 * @param {string} filename  – value stored in DB (S3 key or bare filename)
 * @param {string} localDir  – absolute path for local fallback directory
 * @returns {{ isS3: boolean, url?: string, localPath?: string }}
 */
export const getFileLocation = async (filename, localDir) => {
  if (isS3Enabled()) {
    const client = getS3Client();
    // filename stored in DB is the full S3 key (e.g. "documents/1234-file.pdf")
    const key = filename.includes('/') ? filename : `${path.basename(localDir)}/${filename}`;

    const url = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }),
      { expiresIn: 300 } // 5 minutes
    );
    return { isS3: true, url };
  }

  return { isS3: false, localPath: path.join(localDir, filename) };
};

/**
 * Delete a file from S3 or local disk.
 * @param {string} filename – value stored in DB
 * @param {string} localDir – absolute path for local fallback directory
 */
export const deleteFile = async (filename, localDir) => {
  if (isS3Enabled()) {
    const client = getS3Client();
    const key = filename.includes('/') ? filename : `${path.basename(localDir)}/${filename}`;
    await client.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }));
    return;
  }

  const filePath = path.join(localDir, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};
