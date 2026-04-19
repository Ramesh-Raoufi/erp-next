import { ApiError } from "../utils/http";
import { unitMeasuresRepository } from "../repositories/unitMeasures.repository";
import { normalizeCode, prepareCodeForCreate } from "../utils/code";
import { prisma } from "../db/prisma";

type RelatedUnitInput = {
  code?: string;
  name: string;
  symbol?: string;
  factor: string | number;
};

const prismaAny = prisma as any;

async function resolveCode(provided?: string | null) {
  return prepareCodeForCreate({
    provided: provided ?? undefined,
    findByCode: unitMeasuresRepository.findByCode,
    findByCodeAny: unitMeasuresRepository.findByCodeAny,
    getLatestCode: unitMeasuresRepository.getLatestCode,
    clearCodeForId: async (id) => {
      await unitMeasuresRepository.update(id, { code: null });
    }
  });
}

export const unitMeasuresService = {
  async create(data: {
    code?: string;
    name: string;
    symbol?: string;
    baseUnitId?: number | null;
    factor?: string | number | null;
    relatedUnits?: RelatedUnitInput[];
  }) {
    if (data.baseUnitId) {
      const base = await prismaAny.unitMeasure.findFirst({
        where: { id: data.baseUnitId, deletedAt: null }
      });
      if (!base) throw new ApiError(400, "Invalid base_unit_id");
    }

    const relatedUnits = data.relatedUnits ?? [];
    if (data.baseUnitId && relatedUnits.length > 0) {
      throw new ApiError(400, "Related units can only be created for base units");
    }

    if (data.baseUnitId && (!data.factor || Number(data.factor) <= 0)) {
      throw new ApiError(400, "factor is required for related units");
    }

    const code = await resolveCode(data.code);

    const relatedUnitsData: any[] = [];
    for (const related of relatedUnits) {
      if (!related.name?.trim()) {
        throw new ApiError(400, "Related unit name is required");
      }
      const factor = Number(related.factor);
      if (!Number.isFinite(factor) || factor <= 0) {
        throw new ApiError(400, "Related unit factor must be > 0");
      }
      const relatedCode = await resolveCode(related.code ?? null);
      relatedUnitsData.push({
        code: relatedCode,
        name: related.name.trim(),
        symbol: related.symbol?.trim() || undefined,
        factor
      });
    }

    const createData: any = {
      code,
      name: data.name.trim(),
      symbol: data.symbol?.trim() || undefined,
      factor: data.factor != null ? Number(data.factor) : undefined,
      ...(data.baseUnitId
        ? { baseUnit: { connect: { id: data.baseUnitId } } }
        : {}),
      ...(relatedUnitsData.length
        ? { relatedUnits: { create: relatedUnitsData } }
        : {})
    };

    return unitMeasuresRepository.create(createData);
  },

  list() {
    return unitMeasuresRepository.list();
  },

  async getById(id: number) {
    const unit = await unitMeasuresRepository.findById(id);
    if (!unit) throw new ApiError(404, "Unit measure not found");
    return unit;
  },

  async update(id: number, data: any): Promise<any> {
    if ((data as any).code) {
      const normalized = normalizeCode((data as any).code);
      if (normalized) {
        const existing = await unitMeasuresRepository.findByCode(normalized);
        if (existing && existing.id !== id) {
          throw new ApiError(400, "Code already exists");
        }
        (data as any).code = normalized;
      }
    }
    if ((data as any).baseUnitId) {
      const base = await prismaAny.unitMeasure.findFirst({
        where: { id: (data as any).baseUnitId, deletedAt: null }
      });
      if (!base) throw new ApiError(400, "Invalid base_unit_id");
    }
    try {
      return await unitMeasuresRepository.update(id, data);
    } catch {
      throw new ApiError(404, "Unit measure not found");
    }
  },

  async remove(id: number) {
    try {
      return await unitMeasuresRepository.softDelete(id);
    } catch {
      throw new ApiError(404, "Unit measure not found");
    }
  }
};
