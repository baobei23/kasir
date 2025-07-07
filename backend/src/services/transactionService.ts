import { prisma } from "@/lib/prisma";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionQueryInput,
  AddPaymentInput,
  CancelTransactionInput,
} from "@/schemas/transactionSchemas";
import { AppError } from "@/middleware/errorHandler";
import { generateReceiptNumber } from "@/utils/generateReceiptNumber";

export class TransactionService {
  /**
   * Get all transactions with filtering, searching and pagination
   */
  async getTransactions(query: TransactionQueryInput) {
    const {
      page,
      limit,
      search,
      paymentMethod,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { receiptNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (paymentMethod === "CASH") {
      where.isPaid = true;
    } else if (paymentMethod === "DEBT") {
      where.isPaid = false;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        // Set to end of day
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    // Get transactions with relations
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy === "total" ? "totalAmount" : sortBy]: sortOrder },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true,
                  baseUnit: true,
                },
              },
              unit: {
                select: {
                  name: true,
                  price: true,
                },
              },
            },
          },
          debtRecord: {
            include: {
              payments: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    // Add calculated fields
    const transactionsWithCalculated = transactions.map((transaction) => {
      const remainingDebt = transaction.debtRecord
        ? Number(transaction.totalAmount) -
          Number(transaction.debtRecord.paidAmount)
        : 0;

      return {
        ...transaction,
        itemCount: transaction.items.length,
        remainingDebt,
        isFullyPaid: remainingDebt <= 0,
        paymentMethod: transaction.isPaid ? "CASH" : "DEBT",
        status: transaction.isPaid ? "COMPLETED" : "PENDING",
      };
    });

    return {
      transactions: transactionsWithCalculated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single transaction by ID
   */
  async getTransactionById(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                units: true,
                category: true,
              },
            },
            unit: true,
          },
        },
        debtRecord: {
          include: {
            payments: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError("Transaksi tidak ditemukan", 404);
    }

    const remainingDebt = transaction.debtRecord
      ? Number(transaction.totalAmount) -
        Number(transaction.debtRecord.paidAmount)
      : 0;

    return {
      ...transaction,
      itemCount: transaction.items.length,
      remainingDebt,
      isFullyPaid: remainingDebt <= 0,
      paymentMethod: transaction.isPaid ? "CASH" : "DEBT",
      status: transaction.isPaid ? "COMPLETED" : "PENDING",
    };
  }

  /**
   * Get transaction by receipt number
   */
  async getTransactionByReceiptNumber(receiptNumber: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { receiptNumber },
      include: {
        items: {
          include: {
            product: {
              include: {
                units: true,
                category: true,
              },
            },
            unit: true,
          },
        },
        debtRecord: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError("Transaksi tidak ditemukan", 404);
    }

    const remainingDebt = transaction.debtRecord
      ? Number(transaction.totalAmount) -
        Number(transaction.debtRecord.paidAmount)
      : 0;

    return {
      ...transaction,
      remainingDebt,
      isFullyPaid: remainingDebt <= 0,
      paymentMethod: transaction.isPaid ? "CASH" : "DEBT",
      status: transaction.isPaid ? "COMPLETED" : "PENDING",
    };
  }

  /**
   * Create new transaction with automatic stock update
   */
  async createTransaction(data: CreateTransactionInput) {
    // Validate all products exist and have sufficient stock
    const productValidations = await Promise.all(
      data.items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { units: true },
        });

        if (!product) {
          throw new AppError(
            `Produk dengan ID ${item.productId} tidak ditemukan`,
            404
          );
        }

        // Find the unit
        const unit = product.units.find((u) => u.name === item.unitName);
        if (!unit) {
          throw new AppError(
            `Unit ${item.unitName} tidak ditemukan untuk produk ${product.name}`,
            404
          );
        }

        // Calculate stock needed in base units
        const stockNeeded = item.quantity * Number(unit.conversionRate);

        if (product.stock < stockNeeded) {
          throw new AppError(
            `Stok tidak mencukupi untuk ${product.name}. Stok tersedia: ${product.stock} ${product.baseUnit}, dibutuhkan: ${stockNeeded} ${product.baseUnit}`,
            400
          );
        }

        // Validate price matches unit price (optional validation)
        if (Math.abs(item.price - Number(unit.price)) > 0.01) {
          console.warn(
            `Price mismatch for ${product.name} - ${unit.name}: expected ${unit.price}, got ${item.price}`
          );
        }

        return {
          product,
          unit,
          stockNeeded,
          item,
        };
      })
    );

    // Calculate total
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    // Validate payment for CASH transactions
    if (data.paymentMethod === "CASH" && data.paidAmount < totalAmount) {
      throw new AppError(
        "Jumlah bayar tidak mencukupi untuk transaksi CASH",
        400
      );
    }

    // Generate receipt number
    const receiptNumber = await generateReceiptNumber();

    // Create transaction in a database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          receiptNumber,
          customerName: data.customerName,
          customerAddress: null,
          totalAmount,
          paymentAmount: data.paidAmount,
          changeAmount:
            data.paymentMethod === "CASH" ? data.paidAmount - totalAmount : 0,
          isPaid: data.paymentMethod === "CASH",
          notes: data.notes,
        },
      });

      // 2. Update product stocks and create stock movements
      for (const validation of productValidations) {
        const { product, stockNeeded } = validation;

        // Update product stock
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock - stockNeeded,
          },
        });

        // Create stock movement record
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: "OUT",
            quantity: -stockNeeded, // Negative for outgoing stock
            referenceId: transaction.id,
            referenceType: "TRANSACTION",
            notes: `Penjualan - ${receiptNumber}`,
          },
        });
      }

      // 3. Create debt record if payment method is DEBT
      if (data.paymentMethod === "DEBT") {
        await tx.debtRecord.create({
          data: {
            transactionId: transaction.id,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            totalDebt: totalAmount,
            paidAmount: data.paidAmount,
            remainingDebt: totalAmount - data.paidAmount,
            status: data.paidAmount >= totalAmount ? "PAID" : "PENDING",
          },
        });
      }

      return transaction;
    });

    // Return the created transaction with additional data
    return await this.getTransactionById(result.id);
  }

  /**
   * Update transaction (limited fields only)
   */
  async updateTransaction(id: string, data: UpdateTransactionInput) {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        items: true,
        debtRecord: true,
      },
    });

    if (!existingTransaction) {
      throw new AppError("Transaksi tidak ditemukan", 404);
    }

    // Prevent updates on completed transactions except for some fields
    if (
      existingTransaction.isPaid &&
      (data.paymentMethod || data.paidAmount !== undefined)
    ) {
      throw new AppError(
        "Tidak dapat mengubah payment method atau paid amount pada transaksi yang sudah selesai",
        400
      );
    }

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        status: data.status,
        notes: data.notes,
      },
      include: {
        items: {
          include: {
            product: true,
            unit: true,
          },
        },
        debtRecord: true,
      },
    });

    return updatedTransaction;
  }

  /**
   * Cancel transaction and restore stock
   */
  async cancelTransaction(id: string, data: CancelTransactionInput) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: { units: true },
            },
            unit: true,
          },
        },
        stockMovements: true,
        debtRecord: {
          include: { payments: true },
        },
      },
    });

    if (!transaction) {
      throw new AppError("Transaksi tidak ditemukan", 404);
    }

    if (transaction.customerAddress?.startsWith("CANCELLED:")) {
      throw new AppError("Transaksi sudah dibatalkan", 400);
    }

    // Check if debt has payments
    if (transaction.debtRecord && transaction.debtRecord.payments.length > 0) {
      throw new AppError(
        "Tidak dapat membatalkan transaksi yang sudah memiliki pembayaran",
        400
      );
    }

    // Cancel transaction and restore stock
    const result = await prisma.$transaction(async (tx) => {
      // 1. Restore product stocks
      for (const item of transaction.items) {
        const stockToRestore = item.quantity * Number(item.unit.conversionRate);

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: stockToRestore,
            },
          },
        });

        // Create stock movement for restoration
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "IN",
            quantity: stockToRestore,
            referenceId: transaction.id,
            referenceType: "CANCELLATION",
            notes: `Pembatalan transaksi - ${transaction.receiptNumber}: ${data.reason}`,
          },
        });
      }

      // 2. Update debt record status if exists
      if (transaction.debtRecord) {
        await tx.debtRecord.update({
          where: { transactionId: id },
          data: { status: "PAID" },
        });
      }

      // 3. Mark transaction as cancelled
      const cancelledTransaction = await tx.transaction.update({
        where: { id },
        data: {
          customerAddress: `CANCELLED: ${data.reason}`,
        },
      });

      return cancelledTransaction;
    });

    return result;
  }

  /**
   * Add payment to debt transaction
   */
  async addPaymentToDebt(transactionId: string, data: AddPaymentInput) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        debtRecord: {
          include: { payments: true },
        },
      },
    });

    if (!transaction) {
      throw new AppError("Transaksi tidak ditemukan", 404);
    }

    if (!transaction.debtRecord) {
      throw new AppError("Transaksi ini bukan transaksi hutang", 400);
    }

    if (transaction.customerAddress?.startsWith("CANCELLED:")) {
      throw new AppError(
        "Tidak dapat menambah pembayaran pada transaksi yang dibatalkan",
        400
      );
    }

    const currentPaid = Number(transaction.debtRecord.paidAmount);
    const remaining = Number(transaction.totalAmount) - currentPaid;

    if (remaining <= 0) {
      throw new AppError("Hutang sudah lunas", 400);
    }

    if (data.amount > remaining) {
      throw new AppError(
        `Jumlah pembayaran (${data.amount}) melebihi sisa hutang (${remaining})`,
        400
      );
    }

    // Add payment
    const result = await prisma.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.debtPayment.create({
        data: {
          debtRecordId: transaction.debtRecord!.id,
          paymentAmount: data.amount,
          notes: data.notes || `Pembayaran via ${data.paymentMethod}`,
        },
      });

      // Update debt record
      const newPaidAmount = currentPaid + data.amount;
      const newRemainingDebt = Number(transaction.totalAmount) - newPaidAmount;

      const updatedDebtRecord = await tx.debtRecord.update({
        where: { id: transaction.debtRecord!.id },
        data: {
          paidAmount: newPaidAmount,
          remainingDebt: newRemainingDebt,
          status:
            newPaidAmount >= Number(transaction.totalAmount)
              ? "PAID"
              : "PARTIAL",
        },
      });

      // Update transaction if fully paid
      if (newPaidAmount >= Number(transaction.totalAmount)) {
        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            isPaid: true,
            paymentAmount: newPaidAmount,
            changeAmount: newPaidAmount - Number(transaction.totalAmount),
          },
        });
      }

      return { payment, debtRecord: updatedDebtRecord };
    });

    return result;
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(dateFrom?: Date, dateTo?: Date) {
    const where: any = {};

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const [
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      cashTransactions,
      debtTransactions,
      totalSales,
    ] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.count({ where: { ...where, isPaid: true } }),
      prisma.transaction.count({ where: { ...where, isPaid: false } }),
      prisma.transaction.count({ where: { ...where, isPaid: true } }),
      prisma.transaction.count({ where: { ...where, isPaid: false } }),
      prisma.transaction.aggregate({
        where,
        _sum: { totalAmount: true },
      }),
    ]);

    const totalDebt = await prisma.debtRecord.aggregate({
      where: {
        transaction: where.createdAt
          ? { createdAt: where.createdAt }
          : undefined,
        status: { not: "PAID" },
      },
      _sum: { totalDebt: true },
    });

    const totalPaidDebt = await prisma.debtRecord.aggregate({
      where: {
        transaction: where.createdAt
          ? { createdAt: where.createdAt }
          : undefined,
        status: { not: "PAID" },
      },
      _sum: { paidAmount: true },
    });

    return {
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      cancelledTransactions: 0, // Not tracked in current schema
      cashTransactions,
      debtTransactions,
      totalSales: Number(totalSales._sum.totalAmount) || 0,
      totalDebt: Number(totalDebt._sum.totalDebt) || 0,
      totalPaidDebt: Number(totalPaidDebt._sum.paidAmount) || 0,
      remainingDebt:
        (Number(totalDebt._sum.totalDebt) || 0) -
        (Number(totalPaidDebt._sum.paidAmount) || 0),
    };
  }

  /**
   * Get daily sales report
   */
  async getDailySales(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        customerAddress: { not: { startsWith: "CANCELLED:" } },
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, category: { select: { name: true } } },
            },
            unit: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = await this.getTransactionStats(startOfDay, endOfDay);

    return {
      date: date.toISOString().split("T")[0],
      transactions,
      stats,
    };
  }
}
