import { prisma } from "../db/prisma";

const prismaAny = prisma as any;

const publicSelect = {
  id: true,
  code: true,
  name: true,
  lastName: true,
  email: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
};

export const customersRepository = {
  create(data: any) {
    return prismaAny.customer.create({ data, select: publicSelect });
  },

  list() {
    return prismaAny.customer.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
      select: publicSelect
    });
  },

  findById(id: number) {
    return prismaAny.customer.findFirst({
      where: { id, deletedAt: null },
      select: publicSelect
    });
  },

  findByCode(code: string) {
    return prismaAny.customer.findFirst({ where: { code, deletedAt: null }, select: publicSelect });
  },

  findByCodeAny(code: string) {
    return prismaAny.customer.findFirst({ where: { code }, select: publicSelect });
  },

  findByEmail(email: string) {
    return prismaAny.customer.findFirst({ where: { email, deletedAt: null }, select: publicSelect });
  },

  findByEmailAny(email: string) {
    return prismaAny.customer.findFirst({ where: { email }, select: publicSelect });
  },

  getLatestCode() {
    return prismaAny.customer.findFirst({
      where: { deletedAt: null, code: { not: null } },
      orderBy: { code: "desc" },
      select: { code: true }
    });
  },

  async update(id: number, data: any) {
    const existing = await this.findById(id);
    if (!existing) throw new Error("NOT_FOUND");
    return prismaAny.customer.update({ where: { id }, data, select: publicSelect });
  },

  async softDelete(id: number) {
    const existing = await this.findById(id);
    if (!existing) throw new Error("NOT_FOUND");
    return prismaAny.customer.update({
      where: { id },
      data: { deletedAt: new Date(), code: null, email: null },
      select: publicSelect
    });
  }
};
