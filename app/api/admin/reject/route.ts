import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Reject vehicle logic
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
