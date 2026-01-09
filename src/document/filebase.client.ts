import { S3Client } from '@aws-sdk/client-s3';

export const filebaseClient = new S3Client({
  region: 'us-east-1', // Filebase ignore region but AWS SDK requires it
  endpoint: process.env.FILEBASE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY!,
    secretAccessKey: process.env.FILEBASE_SECRET_KEY!,
  },
  forcePathStyle: true,
});
