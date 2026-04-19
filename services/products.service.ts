import type { Prisma, Product } from "@prisma/client";
import { ApiError } from "../utils/http";
import { productsRepository } from "../repositories/products.repository";
import { normalizeCode, prepareCodeForCreate } from "../utils/code";
import { prisma } from "../db/prisma";

const prismaAny = prisma as any;

export const productsService = {
  async create(data: Prisma.ProductCreateInput) {
    if ((data as any).unitMeasureId) {
      const unit = await prismaAny.unitMeasure.findFirst({
        where: { id: (data as any).unitMeasureId, deletedAt: null }
      });
      if (!unit) throw new ApiError(400, "Invalid unit_measure_id");
    }
    const code = await prepareCodeForCreate({
      provided: (data as any).code,
      findByCode: productsRepository.findByCode,
      findByCodeAny: productsRepository.findByCodeAny,
      getLatestCode: productsRepository.getLatestCode,
      clearCodeForId: async (id) => {
        await productsRepository.update(id, { code: null });
      }
    });
    return productsRepository.create({ ...data, code });
  },
  list() {
    return productsRepository.list();
  },
  async getById(id: number) {
    const product = await productsRepository.findById(id);
    if (!product) throw new ApiError(404, "Product not found");
    return product;
  },
  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    if ((data as any).unitMeasureId) {
      const unit = await prismaAny.unitMeasure.findFirst({
        where: { id: (data as any).unitMeasureId, deletedAt: null }
      });
      if (!unit) throw new ApiError(400, "Invalid unit_measure_id");
    }
    if ((data as any).code) {
      const normalized = normalizeCode((data as any).code);
      if (normalized) {
        const existing = await productsRepository.findByCode(normalized);
        if (existing && existing.id !== id) {
          throw new ApiError(400, "Code already exists");
        }
        (data as any).code = normalized;
      }
    }
    try {
      return await productsRepository.update(id, data);
    } catch {
      throw new ApiError(404, "Product not found");
    }
  },
  async remove(id: number) {
    try {
      return await productsRepository.softDelete(id);
    } catch {
      throw new ApiError(404, "Product not found");
    }
  }
};
