import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// API Gateway URL for getting AWS temporary credentials
const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

// Function: Get AWS temporary credentials from API Gateway
async function getAWSCredentials() {
  console.log("Fetching AWS credentials from:", API_GATEWAY_URL);
  try {
    const response = await fetch(API_GATEWAY_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors",
    });
    console.log("Response received:", response);
    if (response.status === 200) {
      const data = await response.json();
      console.log("Credentials data:", data);
      return data;
    } else {
      throw new Error(`Failed to get credentials: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error getting AWS credentials from Lambda:", error);
    throw error;
  }
}

// Function: Initialize S3 client with dynamic credentials
async function initializeS3Client() {
  try {
    // Get dynamic credentials
    const credentials = await getAWSCredentials();

    // Initialize S3 client with dynamic credentials
    const s3Client = new S3Client({
      region: "ap-southeast-2",
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken, // Use sessionToken when using temporary credentials
      },
    });

    return s3Client;
  } catch (error) {
    console.error("Error initializing S3 client:", error);
    throw error;
  }
}

export const generatePresignedUrl = async (bucketName, objectKey) => {
  const s3Client = await initializeS3Client();
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ResponseContentDisposition: "inline",
  });

  try {
    // Set the URL expiration time in seconds, here it's set to 1 hour
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error("Error generating presigned URL", error);
    throw new Error("Failed to generate presigned URL");
  }
};
