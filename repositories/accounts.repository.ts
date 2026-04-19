import { prisma } from "../db/prisma";

export const accountsRepository = {
  create(data: any) {
    return prisma.account.create({
      data,
      include: { accountType: true }
    });
  },

  findByCode(code: string) {
    return prisma.account.findFirst({ where: { code, deletedAt: null } });
  },

  findByCodeAny(code: string) {
    return prisma.account.findFirst({ where: { code } });
  },

  getLatestCode() {
    return prisma.account.findFirst({
      where: { deletedAt: null, code: { not: null } },
      orderBy: { code: "desc" },
      select: { code: true }
    });
  },

  list() {
    return prisma.account.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
      include: { accountType: true }
    });
  },

  findById(id: number) {
    return prisma.account.findFirst({
      where: { id, deletedAt: null },
      include: { accountType: true }
    });
  },

  async update(id: number, data: any) {
    const existing = await prisma.account.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.account.update({ where: { id }, data, include: { accountType: true } });
  },

  async softDelete(id: number) {
    const existing = await prisma.account.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.account.update({
      where: { id },
      data: { deletedAt: new Date(), code: null },
      include: { accountType: true }
    });
  }
};
