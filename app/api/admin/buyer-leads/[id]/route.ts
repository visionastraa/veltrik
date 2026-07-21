import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || !["MANAGER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    const lead = await prisma.buyerLead.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("[ADMIN_BUYER_UPDATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
