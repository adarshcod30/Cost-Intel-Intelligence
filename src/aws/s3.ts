import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
  } : {}),
});

export async function uploadToS3(key: string, data: string) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Body: data,
    ContentType: 'application/json',
  }));
}

export async function getFromS3(key: string) {
  const res = await s3.send(new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key
  }));
  return res;
}
