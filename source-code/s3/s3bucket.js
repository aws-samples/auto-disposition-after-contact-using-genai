import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
const s3Client = new S3Client({});


export async function getS3ObjetData(bucket, key) {
  try {
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(getObjectCommand);
    const objectBody = await response.Body.transformToString();
    return objectBody;
  } catch (error) {
    console.error('Error retrieving object from S3:', error);
    throw new Error('Failed to retrieve object from S3');
  }
}
