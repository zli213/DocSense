import { NextResponse } from "next/server";
import { generatePresignedUrl } from "@/lib/s3Service";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bucketName = searchParams.get("bucketName");
  const objectKey = searchParams.get("objectKey");

  if (!bucketName || !objectKey) {
    return NextResponse.json(
      { error: "Missing bucketName or objectKey" },
      { status: 400 }
    );
  }

  try {
    const url = await generatePresignedUrl(bucketName, objectKey);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate URL" },
      { status: 500 }
    );
  }
}
