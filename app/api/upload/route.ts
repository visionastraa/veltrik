import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "misc"
    const entityId = (formData.get("entityId") as string) || session.user.id

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "File exceeds 5MB limit" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Magic Bytes Validation
    const { fileTypeFromBuffer } = await import('file-type')
    const type = await fileTypeFromBuffer(buffer)
    
    if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
      return NextResponse.json({ success: false, error: `Invalid file type. Allowed: JPEG, PNG, WEBP.` }, { status: 400 })
    }

    const ext = type.ext
    const filename = `${crypto.randomUUID()}.${ext}`
    
    // Base path logic
    const baseUploadDir = process.env.UPLOAD_DIR || join(process.cwd(), "public", "uploads")
    const entityDir = join(baseUploadDir, folder, entityId)

    await mkdir(entityDir, { recursive: true })
    await writeFile(join(entityDir, filename), buffer)

    return NextResponse.json({
      success: true,
      url: `/uploads/${folder}/${entityId}/${filename}`,
    })
  } catch (error) {
    console.error("[upload] error:", error)
    return NextResponse.json({ success: false, error: "Failed to upload" }, { status: 500 })
  }
}
