import { Router, Request, Response } from "express";
import { asyncHandler } from "@/middleware/errorHandler";

const router = Router();

// GET /api/transactions - Ambil riwayat transaksi
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Implement dengan Prisma
    res.json({
      success: true,
      message: "Transactions endpoint - Coming soon",
      data: [],
    });
  })
);

// GET /api/transactions/:id - Detail transaksi
router.get(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Implement dengan Prisma
    res.json({
      success: true,
      message: "Transaction detail endpoint - Coming soon",
      data: null,
    });
  })
);

// POST /api/transactions - Buat transaksi baru
router.post(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Implement dengan Prisma dan update stok otomatis
    res.json({
      success: true,
      message: "Create transaction endpoint - Coming soon",
      data: null,
    });
  })
);

// POST /api/transactions/:id/receipt - Generate receipt PDF
router.post(
  "/:id/receipt",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Implement PDF generation
    res.json({
      success: true,
      message: "Generate receipt endpoint - Coming soon",
      data: null,
    });
  })
);

export default router;
