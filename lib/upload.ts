import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]
const MAX_FILE_SIZE = 10 * 1024 * 1024

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export async function uploadFile(file: File): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { success: false, error: `File type ${file.type} not allowed` }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "File exceeds 10MB limit" }
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
    const uploadDir = join(process.cwd(), "public", "uploads")

    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, filename), buffer)

    return { success: true, url: `/uploads/${filename}` }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return { success: false, error: message }
  }
}
