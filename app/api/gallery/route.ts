import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface ImageItem {
  key: string;
  name: string;
  url: string;
  size: number;
  lastModified: Date;
}

export async function GET(request: NextRequest) {
  try {
    const bucketName = process.env.AWS_S3_BUCKET!;
    const prefix = 'photos/';

    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: 100,
    });

    const listResponse = await s3Client.send(listCommand);

    if (!listResponse.Contents) {
      return NextResponse.json({ images: [] });
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    
    const imagePromises = listResponse.Contents
      .filter((object) => {
        const key = object.Key || '';
        return (
          key !== prefix &&
          imageExtensions.some((ext) => key.toLowerCase().endsWith(ext))
        );
      })
      .map(async (object) => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: object.Key!,
        });

        const url = await getSignedUrl(s3Client, getObjectCommand, {
          expiresIn: 3600,
        });

        return {
          key: object.Key!,
          name: object.Key!.replace(prefix, ''),
          url,
          size: object.Size || 0,
          lastModified: object.LastModified || new Date(),
        } as ImageItem;
      });

    const images = await Promise.all(imagePromises);

    images.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching images from S3:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}