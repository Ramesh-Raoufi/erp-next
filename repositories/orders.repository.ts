import { prisma } from "../db/prisma";

export const ordersRepository = {
  create(data: any) {
    return prisma.order.create({
      data,
      include: {
        customer: true,
        items: { include: { product: true, unitMeasure: true } },
        transfers: true,
        payments: true
      }
    });
  },

  findByCode(code: string) {
    return prisma.order.findFirst({ where: { code, deletedAt: null } });
  },

  findByCodeAny(code: string) {
    return prisma.order.findFirst({ where: { code } });
  },

  getLatestCode() {
    return prisma.order.findFirst({
      where: { deletedAt: null, code: { not: null } },
      orderBy: { code: "desc" },
      select: { code: true }
    });
  },

  list() {
    return prisma.order.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
      include: { customer: true, items: { include: { product: true, unitMeasure: true } } }
    });
  },

  findById(id: number) {
    return prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        transfers: true,
        payments: true,
        items: { include: { product: true, unitMeasure: true } }
      }
    });
  },

  async update(id: number, data: any) {
    const existing = await prisma.order.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.order.update({ where: { id }, data });
  },

  async softDelete(id: number) {
    const existing = await prisma.order.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.order.update({ where: { id }, data: { deletedAt: new Date(), code: null } });
  }
};
