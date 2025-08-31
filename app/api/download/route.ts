import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const filename = searchParams.get('filename');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing image key parameter' },
        { status: 400 }
      );
    }

    const bucketName = process.env.AWS_S3_BUCKET!;

    // Get the object from S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(getObjectCommand);

    if (!response.Body) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Convert the stream to buffer more safely
    let buffer: Buffer;
    
    if (response.Body instanceof ReadableStream) {
      const chunks: Uint8Array[] = [];
      const reader = response.Body.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      
      buffer = Buffer.concat(chunks);
    } else {
      // Fallback for other stream types
      const bodyBytes = await response.Body.transformToByteArray();
      buffer = Buffer.from(bodyBytes);
    }

    // Determine content type based on file extension
    const getContentType = (key: string): string => {
      const ext = key.toLowerCase().split('.').pop();
      switch (ext) {
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'png':
          return 'image/png';
        case 'gif':
          return 'image/gif';
        case 'webp':
          return 'image/webp';
        case 'bmp':
          return 'image/bmp';
        default:
          return 'application/octet-stream';
      }
    };

    const contentType = getContentType(key);
    const downloadFilename = filename || key.split('/').pop() || 'download';

    // Return the file with proper headers for download
    // Convert Buffer to Uint8Array for Response compatibility
    const uint8Array = new Uint8Array(buffer);
    
    return new Response(uint8Array, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download image' },
      { status: 500 }
    );
  }
}