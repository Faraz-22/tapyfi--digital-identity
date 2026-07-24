import path from "path";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export interface UploadResult {
  url: string;
  filename: string;
}

/**
 * Unified Storage Service
 * Handles file persistence. Falls back to local filesystem store,
 * and streams files to AWS S3 if credentials are provided.
 */
export class StorageService {
  private static localUploadsDir = path.join(process.cwd(), "uploads");

  public static async saveFile(file: Express.Multer.File): Promise<UploadResult> {
    const apiBaseUrl = process.env.API_URL || "http://localhost:4000";

    // 1. S3 / Cloud Storage Integration (Production)
    const s3Bucket = process.env.AWS_S3_BUCKET;
    const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
    const awsRegion = process.env.AWS_REGION || "us-east-1";
    
    if (s3Bucket && awsAccessKey && awsSecretKey) {
      try {
        console.log(`[StorageService] S3 detected. Ready to stream ${file.originalname} to bucket ${s3Bucket}`);
        const s3Client = new S3Client({
          region: awsRegion,
          credentials: {
            accessKeyId: awsAccessKey,
            secretAccessKey: awsSecretKey,
          },
        });

        const key = `${Date.now()}-${file.filename || file.originalname}`;
        const fileStream = fs.createReadStream(file.path);

        await s3Client.send(
          new PutObjectCommand({
            Bucket: s3Bucket,
            Key: key,
            Body: fileStream,
            ContentType: file.mimetype,
          })
        );

        // Try to clean up local multer temp file
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.warn("[StorageService] Failed to clean up temporary upload file:", err);
        }

        const fileUrl = `https://${s3Bucket}.s3.${awsRegion}.amazonaws.com/${key}`;
        return { url: fileUrl, filename: key };
      } catch (error) {
        console.error("[StorageService] AWS S3 upload failed, falling back to local storage:", error);
      }
    }

    // 2. Fallback to Local Disk Storage (Default Dev environment)
    if (!fs.existsSync(this.localUploadsDir)) {
      fs.mkdirSync(this.localUploadsDir, { recursive: true });
    }

    const fileUrl = `${apiBaseUrl}/uploads/${file.filename}`;
    return {
      url: fileUrl,
      filename: file.filename
    };
  }

  /**
   * Optional helper to clean up files locally
   */
  public static async deleteFile(filename: string): Promise<void> {
    const localPath = path.join(this.localUploadsDir, filename);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }
}
