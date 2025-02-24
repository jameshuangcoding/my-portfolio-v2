import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    // List all objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
    });

    const { Contents } = await s3.send(listCommand);

    if (!Contents) {
      return NextResponse.json({ error: "No images found" }, { status: 404 });
    }

    // Generate signed URLs for each image
    const images = await Promise.all(
      Contents.map(async (item) => {
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: item.Key!,
        });
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour

        return {
          key: item.Key,
          lastModified: item.LastModified,
          size: item.Size,
          url,
        };
      })
    );

    return NextResponse.json({ images });

  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
