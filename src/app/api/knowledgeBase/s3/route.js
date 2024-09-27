import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Load environment variables
require("dotenv").config();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION, // Use environment variables
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Use environment variables
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Use environment variables
  },
});

// Your GET handler remains unchanged
export async function GET(req, res) {
  const { searchParams } = new URL(req.url);
  const bucketName = searchParams.get("bucketName");
  const objectKey = searchParams.get("objectKey");

  if (!bucketName || !objectKey) {
    return new Response(
      JSON.stringify({ error: "Missing bucketName or objectKey" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    }); // URL expires in 1 hour

    return new Response(JSON.stringify({ url: presignedUrl }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating presigned URL", error);
    return new Response(
      JSON.stringify({ error: "Error generating presigned URL" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
