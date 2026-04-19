import { ApiError } from "../utils/http";
import { driversRepository } from "../repositories/drivers.repository";
import { normalizeCode, prepareCodeForCreate } from "../utils/code";

export const driversService = {
  async create(data: any) {
    const code = await prepareCodeForCreate({
      provided: data.code,
      findByCode: driversRepository.findByCode,
      findByCodeAny: driversRepository.findByCodeAny,
      getLatestCode: driversRepository.getLatestCode,
      clearCodeForId: async (id) => {
        await driversRepository.update(id, { code: null });
      }
    });
    return driversRepository.create({ ...data, code });
  },
  list() {
    return driversRepository.list();
  },
  async getById(id: number) {
    const driver = await driversRepository.findById(id);
    if (!driver) throw new ApiError(404, "Driver not found");
    return driver;
  },
  async update(id: number, data: any) {
    if (data.code) {
      const normalized = normalizeCode(data.code);
      if (normalized) {
        const existing = await driversRepository.findByCode(normalized);
        if (existing && existing.id !== id) {
          throw new ApiError(400, "Code already exists");
        }
        data.code = normalized;
      }
    }
    try {
      return await driversRepository.update(id, data);
    } catch {
      throw new ApiError(404, "Driver not found");
    }
  },
  async remove(id: number) {
    try {
      return await driversRepository.softDelete(id);
    } catch {
      throw new ApiError(404, "Driver not found");
    }
  }
};
