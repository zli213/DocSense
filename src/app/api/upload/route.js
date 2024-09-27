import { promises as fs } from 'fs'
import path from 'path'

export const POST = async (req) => {
  try {
    const data = await req.json();
    const { imageBase64, fileName } = data;

    // Remove the data URL header to get the base64-encoded data
    const base64Image = imageBase64.split(';base64,').pop();

    // Define the path to save the image (within the public folder)
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

    // Write the image file
    await fs.writeFile(filePath, base64Image, { encoding: 'base64' });

    return new Response(JSON.stringify({ message: 'Image uploaded successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error uploading image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
