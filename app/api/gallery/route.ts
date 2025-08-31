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

export interface GalleryResponse {
  images: ImageItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    
    const bucketName = process.env.AWS_S3_BUCKET!;
    const prefix = 'photos/';

    // First, get all objects to count total
    let allObjects: any[] = [];
    let continuationToken: string | undefined;

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        MaxKeys: 1000,
        ContinuationToken: continuationToken,
      });

      const listResponse = await s3Client.send(listCommand);
      
      if (listResponse.Contents) {
        allObjects.push(...listResponse.Contents);
      }
      
      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);

    if (allObjects.length === 0) {
      return NextResponse.json({
        images: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      } as GalleryResponse);
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    
    // Filter for image files only
    const imageObjects = allObjects.filter((object) => {
      const key = object.Key || '';
      return (
        key !== prefix &&
        imageExtensions.some((ext) => key.toLowerCase().endsWith(ext))
      );
    });

    // Sort by last modified (newest first)
    imageObjects.sort((a, b) => {
      const aTime = a.LastModified?.getTime() || 0;
      const bTime = b.LastModified?.getTime() || 0;
      return bTime - aTime;
    });

    const totalCount = imageObjects.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // Get objects for current page
    const pageObjects = imageObjects.slice(startIndex, endIndex);

    // Generate presigned URLs for current page
    const imagePromises = pageObjects.map(async (object) => {
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

    return NextResponse.json({
      images,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    } as GalleryResponse);
  } catch (error) {
    console.error('Error fetching images from S3:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}