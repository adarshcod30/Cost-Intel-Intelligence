import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { S3_BUCKETS } from "./config";

const s3 = new S3Client({
  region: process.env.REGION || 'us-east-1',
  // In Cloud mode (Amplify), we rely 100% on the IAM role.
  ...(process.env.APP_MODE === 'local' && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
  } : {}),
});

export async function uploadToS3(key: string, data: string) {
  console.log(`[S3] Uploading to bucket: ${S3_BUCKETS.DATA}`);
  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKETS.DATA,
    Key: key,
    Body: data,
    ContentType: 'application/json',
  }));
}

export async function getFromS3(key: string) {
  const res = await s3.send(new GetObjectCommand({
    Bucket: S3_BUCKETS.DATA,
    Key: key
  }));
  return res;
}
