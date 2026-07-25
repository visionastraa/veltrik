import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), "public", "uploads")
    const filePath = join(uploadDir, filename)

    if (!existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    
    // Determine content type based on extension
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'avif': 'image/avif',
      'gif': 'image/gif'
    }
    
    const contentType = contentTypes[ext] || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    })
  } catch (error) {
    console.error("[image_serve] error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
