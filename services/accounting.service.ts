import { prisma } from "@/db/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaAny = prisma as any;

export const accountingService = {
  /** Creates a balanced journal entry (debit total must equal credit total) */
  async createEntry(params: {
    description: string;
    date?: Date;
    lines: Array<{
      accountId: number;
      type: "debit" | "credit";
      amount: number;
    }>;
    relatedType?: string;
    relatedId?: number;
  }) {
    const totalDebit = params.lines
      .filter((l) => l.type === "debit")
      .reduce((s, l) => s + l.amount, 0);
    const totalCredit = params.lines
      .filter((l) => l.type === "credit")
      .reduce((s, l) => s + l.amount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new Error(
        `Journal entry not balanced: debit ${totalDebit} ≠ credit ${totalCredit}`
      );
    }

    return prismaAny.journalEntry.createMany({
      data: params.lines.map((line) => ({
        description: params.description,
        date: params.date ?? new Date(),
        accountId: line.accountId,
        type: line.type,
        amount: line.amount,
        relatedType: params.relatedType,
        relatedId: params.relatedId,
      })),
    });
  },

  /** Find first account by name (case-insensitive, partial) */
  async findAccount(namePart: string): Promise<{ id: number } | null> {
    return prismaAny.account.findFirst({
      where: {
        name: { contains: namePart, mode: "insensitive" },
        deletedAt: null,
      },
      select: { id: true },
    });
  },

  /** Record journal entries when an invoice is marked paid */
  async recordInvoicePaid(invoiceId: number, amount: number) {
    try {
      const receivable = await this.findAccount("receivable");
      const revenue = await this.findAccount("revenue");
      if (!receivable || !revenue) return;
      await this.createEntry({
        description: `Invoice #${invoiceId} paid`,
        relatedType: "invoice",
        relatedId: invoiceId,
        lines: [
          { accountId: receivable.id, type: "debit", amount },
          { accountId: revenue.id, type: "credit", amount },
        ],
      });
    } catch (e) {
      console.error("Journal entry (invoice paid) failed:", e);
    }
  },

  /** Record journal entries when a bill is marked paid */
  async recordBillPaid(billId: number, amount: number) {
    try {
      const expense = await this.findAccount("expense");
      const payable = await this.findAccount("payable");
      if (!expense || !payable) return;
      await this.createEntry({
        description: `Bill #${billId} paid`,
        relatedType: "bill",
        relatedId: billId,
        lines: [
          { accountId: expense.id, type: "debit", amount },
          { accountId: payable.id, type: "credit", amount },
        ],
      });
    } catch (e) {
      console.error("Journal entry (bill paid) failed:", e);
    }
  },

  /** Record journal entries when a customer payment is received */
  async recordCustomerPayment(paymentId: number, amount: number) {
    try {
      const cash = await this.findAccount("cash");
      const receivable = await this.findAccount("receivable");
      if (!cash || !receivable) return;
      await this.createEntry({
        description: `Customer payment #${paymentId}`,
        relatedType: "payment",
        relatedId: paymentId,
        lines: [
          { accountId: cash.id, type: "debit", amount },
          { accountId: receivable.id, type: "credit", amount },
        ],
      });
    } catch (e) {
      console.error("Journal entry (customer payment) failed:", e);
    }
  },
};
