/* eslint-disable @typescript-eslint/no-explicit-any */
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../db/prisma";
import { ApiError } from "../utils/http";
import { ordersRepository } from "../repositories/orders.repository";
import { prepareCodeForCreate } from "../utils/code";

const DEFAULT_ORIGIN = process.env.STORE_ORIGIN || "Main Warehouse";

type StoreListQuery = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc";
};

function buildDestination(shipping: {
  address1: string;
  address2?: string | null;
  city: string;
  region?: string | null;
  postalCode?: string | null;
  country: string;
}) {
  const parts = [
    shipping.address1,
    shipping.address2,
    shipping.city,
    shipping.region,
    shipping.postalCode,
    shipping.country
  ]
    .map((part) => (part ?? "").trim())
    .filter(Boolean);
  return parts.join(", ");
}

export const storeService = {
  async listProducts(query: StoreListQuery) {
    const where: any = { deletedAt: null, isActive: true };

    if (query.q) {
      const value = query.q.trim();
      if (value) {
        where.OR = [
          { name: { contains: value, mode: "insensitive" } },
          { description: { contains: value, mode: "insensitive" } },
          { category: { contains: value, mode: "insensitive" } }
        ];
      }
    }

    if (query.category) {
      const category = query.category.trim();
      if (category) {
        where.category = { equals: category, mode: "insensitive" };
      }
    }

    if (query.minPrice != null || query.maxPrice != null) {
      where.price = {
        ...(query.minPrice != null ? { gte: query.minPrice } : {}),
        ...(query.maxPrice != null ? { lte: query.maxPrice } : {})
      };
    }

    const orderBy: any =
      query.sort === "price_asc"
        ? { price: "asc" }
        : query.sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

    return prisma.product.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        compareAtPrice: true,
        imageUrl: true,
        category: true,
        quantity: true
      }
    });
  },

  async getProduct(id: number) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null, isActive: true }
    });
    if (!product) throw new ApiError(404, "Product not found");
    return product;
  },

  async listCategories() {
    const rows = await prisma.product.findMany({
      where: { deletedAt: null, isActive: true, category: { not: null } },
      distinct: ["category"],
      select: { category: true }
    });
    return rows
      .map((row) => (row.category ?? "").trim())
      .filter((value) => value.length > 0)
      .sort((a, b) => a.localeCompare(b));
  },

  async createOrder(data: {
    customer: {
      name: string;
      lastName?: string | null;
      email: string;
      phone?: string | null;
    };
    shipping: {
      address1: string;
      address2?: string | null;
      city: string;
      region?: string | null;
      postalCode?: string | null;
      country: string;
    };
    items: Array<{ product_id: number; quantity: number }>;
    paymentMethod: "cash" | "card" | "bank";
  }) {
    const itemMap = new Map<number, number>();
    for (const item of data.items) {
      const current = itemMap.get(item.product_id) ?? 0;
      itemMap.set(item.product_id, current + item.quantity);
    }
    const normalizedItems = Array.from(itemMap.entries()).map(
      ([product_id, quantity]) => ({ product_id, quantity })
    );
    const productIds = [...itemMap.keys()];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, deletedAt: null, isActive: true }
    });

    if (products.length !== productIds.length) {
      throw new ApiError(400, "One or more products are unavailable");
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let total = new Decimal(0);

    for (const item of normalizedItems) {
      const product = productMap.get(item.product_id);
      if (!product) throw new ApiError(400, "Invalid product_id");
      if (item.quantity > product.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }
      const unitPrice = new Decimal(product.price);
      total = total.plus(unitPrice.mul(item.quantity));
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: { email: data.customer.email, deletedAt: null }
    });

    const destination = buildDestination(data.shipping);

    const code = await prepareCodeForCreate({
      provided: undefined,
      findByCode: ordersRepository.findByCode,
      findByCodeAny: ordersRepository.findByCodeAny,
      getLatestCode: ordersRepository.getLatestCode,
      clearCodeForId: async (id) => {
        await ordersRepository.update(id, { code: null });
      }
    });

    return prisma.$transaction(async (tx) => {
      const customer = existingCustomer
        ? await tx.customer.update({
            where: { id: existingCustomer.id },
            data: {
              name: data.customer.name,
              lastName: data.customer.lastName ?? null,
              phone: data.customer.phone ?? null
            }
          })
        : await tx.customer.create({
            data: {
              code: null,
              name: data.customer.name,
              lastName: data.customer.lastName ?? null,
              email: data.customer.email,
              phone: data.customer.phone ?? null
            }
          });

      const order = await tx.order.create({
        data: {
          code,
          customer: { connect: { id: customer.id } },
          origin: DEFAULT_ORIGIN,
          destination,
          status: "pending",
          totalPrice: total,
          items: {
            create: normalizedItems.map((item) => {
              const product = productMap.get(item.product_id)!;
              const unitPrice = new Decimal(product.price);
              const payload: any = {
                product: { connect: { id: product.id } },
                quantity: item.quantity,
                unitPrice,
                totalPrice: unitPrice.mul(item.quantity)
              };
              if (product.unitMeasureId) {
                payload.unitMeasure = { connect: { id: product.unitMeasureId } };
              }
              return payload;
            })
          }
        },
        include: {
          customer: true,
          items: { include: { product: true } }
        }
      });

      for (const item of normalizedItems) {
        await tx.product.update({
          where: { id: item.product_id },
          data: { quantity: { decrement: item.quantity } }
        });
      }

      await tx.payment.create({
        data: {
          code: null,
          order: { connect: { id: order.id } },
          amount: total,
          method: data.paymentMethod,
          status: "unpaid"
        }
      });

      return order;
    });
  }
};
