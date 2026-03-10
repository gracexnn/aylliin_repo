import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

function getR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function generateUploadUrl(
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const r2PublicUrl = process.env.R2_PUBLIC_URL;
  if (!r2PublicUrl) {
    throw new Error('R2_PUBLIC_URL environment variable is not set');
  }

  const client = getR2Client();
  const ext = fileName.split('.').pop();
  const key = `${folder}/${uuidv4()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  const publicUrl = `${r2PublicUrl.replace(/\/$/, '')}/${key}`;

  console.log('[r2] publicUrl:', publicUrl);

  return { uploadUrl, publicUrl, key };
}

export async function deleteFile(key: string): Promise<void> {
  const client = getR2Client();
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });
  await client.send(command);
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}
