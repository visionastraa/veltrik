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
    const { price, status } = body;

    const dataToUpdate: any = {};
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (status !== undefined) dataToUpdate.status = status;

    const listing = await prisma.listing.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    console.error("[ADMIN_LISTING_UPDATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
