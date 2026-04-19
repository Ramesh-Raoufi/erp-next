import { prisma } from "../db/prisma";

export const expensesRepository = {
  create(data: any) {
    return prisma.expense.create({ data });
  },

  findByCode(code: string) {
    return prisma.expense.findFirst({ where: { code, deletedAt: null } });
  },

  findByCodeAny(code: string) {
    return prisma.expense.findFirst({ where: { code } });
  },

  getLatestCode() {
    return prisma.expense.findFirst({
      where: { deletedAt: null, code: { not: null } },
      orderBy: { code: "desc" },
      select: { code: true }
    });
  },

  list() {
    return prisma.expense.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
      include: { transfer: true }
    });
  },

  findById(id: number) {
    return prisma.expense.findFirst({ where: { id, deletedAt: null }, include: { transfer: true } });
  },

  async update(id: number, data: any) {
    const existing = await prisma.expense.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.expense.update({ where: { id }, data });
  },

  async softDelete(id: number) {
    const existing = await prisma.expense.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.expense.update({ where: { id }, data: { deletedAt: new Date(), code: null } });
  }
};
