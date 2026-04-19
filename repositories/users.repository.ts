import { prisma } from "../db/prisma";

const publicSelect = {
  id: true,
  code: true,
  name: true,
  lastName: true,
  email: true,
  username: true,
  role: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
};

export const usersRepository = {
  create(data: any) {
    return prisma.user.create({ data, select: publicSelect });
  },

  list() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
      select: publicSelect
    });
  },

  findById(id: number) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: publicSelect
    });
  },

  findByEmailForAuth(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { ...publicSelect, passwordHash: true }
    });
  },

  findByUsernameForAuth(username: string) {
    return prisma.user.findFirst({
      where: { username, deletedAt: null },
      select: { ...publicSelect, passwordHash: true }
    });
  },

  findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null }, select: publicSelect });
  },

  findByEmailAny(email: string) {
    return prisma.user.findFirst({ where: { email }, select: publicSelect });
  },

  findByUsername(username: string) {
    return prisma.user.findFirst({ where: { username, deletedAt: null }, select: publicSelect });
  },

  findByUsernameAny(username: string) {
    return prisma.user.findFirst({ where: { username }, select: publicSelect });
  },

  findByCode(code: string) {
    return prisma.user.findFirst({ where: { code, deletedAt: null }, select: publicSelect });
  },

  findByCodeAny(code: string) {
    return prisma.user.findFirst({ where: { code }, select: publicSelect });
  },

  getLatestCode() {
    return prisma.user.findFirst({
      where: { deletedAt: null, code: { not: null } },
      orderBy: { code: "desc" },
      select: { code: true }
    });
  },

  count() {
    return prisma.user.count({ where: { deletedAt: null } });
  },

  countWithPassword() {
    return prisma.user.count({ where: { deletedAt: null, passwordHash: { not: null } } });
  },

  async update(id: number, data: any) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("NOT_FOUND");
    }
    return prisma.user.update({ where: { id }, data, select: publicSelect });
  },

  async softDelete(id: number) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("NOT_FOUND");
    }
    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        code: null,
        email: null,
        username: null,
        passwordHash: null
      },
      select: publicSelect
    });
  }
};
