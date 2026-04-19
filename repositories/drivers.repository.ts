import { prisma } from "../db/prisma";

export const driversRepository = {
  create(data: any) {
    return prisma.driver.create({ data });
  },

  findByCode(code: string) {
    return prisma.driver.findFirst({ where: { code, deletedAt: null } });
  },

  findByCodeAny(code: string) {
    return prisma.driver.findFirst({ where: { code } });
  },

  getLatestCode() {
    return prisma.driver.findFirst({
      where: { deletedAt: null, code: { not: null } },
      orderBy: { code: "desc" },
      select: { code: true }
    });
  },

  list() {
    return prisma.driver.findMany({ where: { deletedAt: null }, orderBy: { id: "desc" } });
  },

  findById(id: number) {
    return prisma.driver.findFirst({ where: { id, deletedAt: null } });
  },

  async update(id: number, data: any) {
    const existing = await this.findById(id);
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.driver.update({ where: { id }, data });
  },

  async softDelete(id: number) {
    const existing = await this.findById(id);
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.driver.update({ where: { id }, data: { deletedAt: new Date(), code: null } });
  }
};
