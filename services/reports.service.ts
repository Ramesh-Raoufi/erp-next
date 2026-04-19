import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../db/prisma";

function d(value: unknown) {
  if (value == null) return new Decimal(0);
  if (typeof value === "string" || typeof value === "number") return new Decimal(value);
  // Prisma returns Decimal-like objects with toString()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Decimal((value as any).toString());
}

export const reportsService = {
  async totalRevenue() {
    const res = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { deletedAt: null, status: { in: ["paid", "partial"] } }
    });
    return d(res._sum.amount);
  },

  async totalExpenses() {
    const shipment = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: { deletedAt: null, type: "shipment" }
    });
    const general = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: { deletedAt: null, type: "general" }
    });
    return {
      shipment: d(shipment._sum.amount),
      general: d(general._sum.amount)
    };
  },

  async adjustmentsSum() {
    const res = await prisma.adjustment.aggregate({
      _sum: { amount: true },
      where: { deletedAt: null }
    });
    return d(res._sum.amount);
  },

  async profitLoss() {
    const revenue = await this.totalRevenue();
    const expenses = await this.totalExpenses();
    const adjustments = await this.adjustmentsSum();
    const profit = revenue.minus(expenses.shipment).minus(expenses.general).plus(adjustments);
    return { revenue, expenses, adjustments, profit };
  }
};
