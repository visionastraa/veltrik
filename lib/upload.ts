import fs from "fs/promises";
import path from "path";

/**
 * Save an uploaded file to /public/uploads/{folder}/{timestamp}-{filename}
 * Creates the directory if it does not exist.
 * Returns the public URL path as a string.
 */
export async function saveFile(file: File, folder: string): Promise<string> {
  const timestamp = Date.now();
  const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${timestamp}-${originalName}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  // Create directory if it doesn't exist
  await fs.mkdir(uploadDir, { recursive: true });

  // Convert File to Buffer and write
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);

  // Return the public URL path
  return `/uploads/${folder}/${filename}`;
}
