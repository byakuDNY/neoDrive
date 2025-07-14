import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { envConfig } from "./envConfig";

export const s3Client = new S3Client({
  endpoint: envConfig.S3_ENDPOINT,
  region: envConfig.S3_REGION,
  credentials: {
    accessKeyId: envConfig.S3_ACCESS_KEY,
    secretAccessKey: envConfig.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

export const validateS3BucketAccess = async () => {
  try {
    const headBucketCommand = new HeadBucketCommand({
      Bucket: envConfig.S3_BUCKET,
    });
    await s3Client.send(headBucketCommand);
    console.log("✅ S3 connection successful - bucket accessible");
    return true;
  } catch (error) {
    console.error("❌ S3 connection failed:", error);
    return false;
  }
};
