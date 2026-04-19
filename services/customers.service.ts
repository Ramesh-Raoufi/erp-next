import { ApiError } from "../utils/http";
import { customersRepository } from "../repositories/customers.repository";
import { normalizeCode, prepareCodeForCreate } from "../utils/code";

export const customersService = {
  list() {
    return customersRepository.list();
  },

  async getById(id: number) {
    const customer = await customersRepository.findById(id);
    if (!customer) throw new ApiError(404, "Customer not found");
    return customer;
  },

  async create(data: {
    code?: string;
    name: string;
    lastName: string;
    email?: string;
    phone?: string;
  }) {
    const code = await prepareCodeForCreate({
      provided: data.code,
      findByCode: customersRepository.findByCode,
      findByCodeAny: customersRepository.findByCodeAny,
      getLatestCode: customersRepository.getLatestCode,
      clearCodeForId: async (id) => {
        await customersRepository.update(id, { code: null });
      }
    });

    if (data.email) {
      const emailValue = String(data.email);
      const existingEmail = await customersRepository.findByEmail(emailValue);
      if (existingEmail) {
        throw new ApiError(400, "Email already exists");
      }
      const existingEmailAny = await customersRepository.findByEmailAny(emailValue);
      if (existingEmailAny && existingEmailAny.deletedAt) {
        await customersRepository.update(existingEmailAny.id, { email: null });
      }
    }

    return customersRepository.create({
      code,
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone
    });
  },

  async update(id: number, data: {
    code?: string;
    name?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }) {
    const existing = await customersRepository.findById(id);
    if (!existing) throw new ApiError(404, "Customer not found");

    if (data.code) {
      const normalized = normalizeCode(data.code);
      if (normalized) {
        const existingCode = await customersRepository.findByCode(normalized);
        if (existingCode && existingCode.id !== id) {
          throw new ApiError(400, "Code already exists");
        }
        data.code = normalized;
      }
    }

    if (data.email) {
      const emailValue = String(data.email);
      const existingEmail = await customersRepository.findByEmail(emailValue);
      if (existingEmail && existingEmail.id !== id) {
        throw new ApiError(400, "Email already exists");
      }
    }

    try {
      return await customersRepository.update(id, data);
    } catch {
      throw new ApiError(404, "Customer not found");
    }
  },

  async remove(id: number) {
    const existing = await customersRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, "Customer not found");
    }
    return customersRepository.softDelete(id);
  }
};
