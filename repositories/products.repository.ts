import { prisma } from "../db/prisma";

export const productsRepository = {
  create(data: any) {
    return prisma.product.create({ data });
  },

  findByCode(code: string) {
    return prisma.product.findFirst({ where: { code, deletedAt: null } });
  },

  findByCodeAny(code: string) {
    return prisma.product.findFirst({ where: { code } });
  },

  getLatestCode() {
    return prisma.product.findFirst({
      where: { deletedAt: null, code: { not: null } },
      orderBy: { code: "desc" },
      select: { code: true }
    });
  },

  list() {
    return prisma.product.findMany({ where: { deletedAt: null }, orderBy: { id: "desc" } });
  },

  findById(id: number) {
    return prisma.product.findFirst({ where: { id, deletedAt: null } });
  },

  async update(id: number, data: any) {
    const existing = await this.findById(id);
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.product.update({ where: { id }, data });
  },

  async softDelete(id: number) {
    const existing = await this.findById(id);
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), code: null }
    });
  }
};
