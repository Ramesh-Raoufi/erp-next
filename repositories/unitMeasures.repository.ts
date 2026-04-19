import { prisma } from "../db/prisma";

const prismaAny = prisma as any;

export const unitMeasuresRepository = {
  create(data: any) {
    return prismaAny.unitMeasure.create({
      data,
      include: { baseUnit: true, relatedUnits: true }
    });
  },

  findByCode(code: string) {
    return prismaAny.unitMeasure.findFirst({ where: { code, deletedAt: null } });
  },

  findByCodeAny(code: string) {
    return prismaAny.unitMeasure.findFirst({ where: { code } });
  },

  getLatestCode() {
    return prismaAny.unitMeasure.findFirst({
      where: { deletedAt: null, code: { not: null } },
      orderBy: { code: "desc" },
      select: { code: true }
    });
  },

  list() {
    return prismaAny.unitMeasure.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
      include: { baseUnit: true }
    });
  },

  findById(id: number) {
    return prismaAny.unitMeasure.findFirst({
      where: { id, deletedAt: null },
      include: { baseUnit: true, relatedUnits: true }
    });
  },

  async update(id: number, data: any) {
    const existing = await this.findById(id);
    if (!existing) throw new Error("NOT_FOUND");
    return prismaAny.unitMeasure.update({ where: { id }, data });
  },

  async softDelete(id: number) {
    const existing = await this.findById(id);
    if (!existing) throw new Error("NOT_FOUND");
    return prismaAny.unitMeasure.update({
      where: { id },
      data: { deletedAt: new Date(), code: null }
    });
  }
};
