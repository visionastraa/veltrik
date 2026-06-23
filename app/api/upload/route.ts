import { NextResponse } from "next/server";
import { saveFile } from "@/lib/upload";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) || "inspections";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const publicUrl = await saveFile(file, folder);
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
