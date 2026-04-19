import { prisma } from "../db/prisma";

export const accountTypesRepository = {
  create(data: any) {
    return prisma.accountType.create({ data });
  },

  findByCode(code: string) {
    return prisma.accountType.findFirst({ where: { code, deletedAt: null } });
  },

  findByCodeAny(code: string) {
    return prisma.accountType.findFirst({ where: { code } });
  },

  getLatestCode() {
    return prisma.accountType.findFirst({
      where: { deletedAt: null, code: { not: null } },
      orderBy: { code: "desc" },
      select: { code: true }
    });
  },

  list() {
    return prisma.accountType.findMany({ where: { deletedAt: null }, orderBy: { id: "desc" } });
  },

  findById(id: number) {
    return prisma.accountType.findFirst({ where: { id, deletedAt: null } });
  },

  async update(id: number, data: any) {
    const existing = await this.findById(id);
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.accountType.update({ where: { id }, data });
  },

  async softDelete(id: number) {
    const existing = await this.findById(id);
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.accountType.update({
      where: { id },
      data: { deletedAt: new Date(), code: null }
    });
  }
};
