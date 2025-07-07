import { Router, Request, Response } from "express";
import { asyncHandler } from "@/middleware/errorHandler";
import { TransactionService } from "@/services/transactionService";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  addPaymentSchema,
  cancelTransactionSchema,
} from "@/schemas/transactionSchemas";

const router = Router();
const transactionService = new TransactionService();

// GET /api/transactions - Ambil semua transaksi dengan filter
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const query = transactionQuerySchema.parse(req.query);
    const result = await transactionService.getTransactions(query);

    res.json({
      success: true,
      message: "Transaksi berhasil diambil",
      data: result.transactions,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  })
);

// GET /api/transactions/stats - Statistik transaksi
router.get(
  "/stats",
  asyncHandler(async (req: Request, res: Response) => {
    const { dateFrom, dateTo } = req.query;

    const fromDate = dateFrom ? new Date(dateFrom as string) : undefined;
    const toDate = dateTo ? new Date(dateTo as string) : undefined;

    const stats = await transactionService.getTransactionStats(
      fromDate,
      toDate
    );

    res.json({
      success: true,
      message: "Statistik transaksi berhasil diambil",
      data: stats,
      timestamp: new Date().toISOString(),
    });
  })
);

// GET /api/transactions/daily/:date - Laporan penjualan harian
router.get(
  "/daily/:date",
  asyncHandler(async (req: Request, res: Response) => {
    const { date } = req.params;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD",
        timestamp: new Date().toISOString(),
      });
    }

    const targetDate = new Date(date);
    const dailySales = await transactionService.getDailySales(targetDate);

    res.json({
      success: true,
      message: "Laporan penjualan harian berhasil diambil",
      data: dailySales,
      timestamp: new Date().toISOString(),
    });
  })
);

// GET /api/transactions/receipt/:receiptNumber - Ambil transaksi berdasarkan receipt number
router.get(
  "/receipt/:receiptNumber",
  asyncHandler(async (req: Request, res: Response) => {
    const receiptNumber = req.params.receiptNumber;
    if (!receiptNumber) {
      return res.status(400).json({
        success: false,
        message: "Receipt number tidak valid",
        timestamp: new Date().toISOString(),
      });
    }

    const transaction = await transactionService.getTransactionByReceiptNumber(
      receiptNumber
    );

    res.json({
      success: true,
      message: "Detail transaksi berhasil diambil",
      data: transaction,
      timestamp: new Date().toISOString(),
    });
  })
);

// GET /api/transactions/:id - Ambil transaksi berdasarkan ID
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID transaksi tidak valid",
        timestamp: new Date().toISOString(),
      });
    }

    const transaction = await transactionService.getTransactionById(id);

    res.json({
      success: true,
      message: "Detail transaksi berhasil diambil",
      data: transaction,
      timestamp: new Date().toISOString(),
    });
  })
);

// POST /api/transactions - Buat transaksi baru
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createTransactionSchema.parse(req.body);
    const transaction = await transactionService.createTransaction(
      validatedData
    );

    res.status(201).json({
      success: true,
      message: "Transaksi berhasil dibuat",
      data: transaction,
      timestamp: new Date().toISOString(),
    });
  })
);

// PUT /api/transactions/:id - Update transaksi
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID transaksi tidak valid",
        timestamp: new Date().toISOString(),
      });
    }

    const validatedData = updateTransactionSchema.parse(req.body);
    const transaction = await transactionService.updateTransaction(
      id,
      validatedData
    );

    res.json({
      success: true,
      message: "Transaksi berhasil diperbarui",
      data: transaction,
      timestamp: new Date().toISOString(),
    });
  })
);

// POST /api/transactions/:id/cancel - Batalkan transaksi
router.post(
  "/:id/cancel",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID transaksi tidak valid",
        timestamp: new Date().toISOString(),
      });
    }

    const validatedData = cancelTransactionSchema.parse(req.body);
    const transaction = await transactionService.cancelTransaction(
      id,
      validatedData
    );

    res.json({
      success: true,
      message: "Transaksi berhasil dibatalkan",
      data: transaction,
      timestamp: new Date().toISOString(),
    });
  })
);

// POST /api/transactions/:id/payments - Tambah pembayaran untuk hutang
router.post(
  "/:id/payments",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID transaksi tidak valid",
        timestamp: new Date().toISOString(),
      });
    }

    const validatedData = addPaymentSchema.parse(req.body);
    const result = await transactionService.addPaymentToDebt(id, validatedData);

    res.json({
      success: true,
      message: "Pembayaran berhasil ditambahkan",
      data: result,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
