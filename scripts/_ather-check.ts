import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const leads = await prisma.sellerLead.findMany({
    where: { OR: [{ make: { contains: "Ather" } }, { model: { contains: "450S" } }] },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      inspection: { include: { inspector: { select: { id: true, name: true, email: true } } } },
      bookings: true,
    },
  });
  console.log(JSON.stringify(leads, null, 2));
}
main().finally(() => prisma.$disconnect());
