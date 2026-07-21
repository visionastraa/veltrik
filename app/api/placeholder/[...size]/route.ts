import { NextRequest } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ size: string[] }> }
) {
  const { size } = await params
  const [w, h] = (size[0] || "800x600").split("x").map(Number)
  const width = Math.min(Math.max(w || 800, 1), 4096)
  const height = Math.min(Math.max(h || 600, 1), 4096)

  const { searchParams } = new URL(_request.url)
  const text = searchParams.get("text") || `${width}×${height}`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#e2e8f0"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${Math.min(width, height) / 12}" fill="#64748b">${text.replace(/</g, "&lt;")}</text>
</svg>`

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
