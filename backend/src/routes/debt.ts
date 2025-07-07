import { Router, Request, Response } from "express";
import { asyncHandler } from "@/middleware/errorHandler";

const router = Router();

// GET /api/debt - Ambil daftar utang customer
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Implement dengan Prisma
    res.json({
      success: true,
      message: "Debt records endpoint - Coming soon",
      data: [],
    });
  })
);

// GET /api/debt/customer/:name - Utang berdasarkan nama customer
router.get(
  "/customer/:name",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Implement dengan Prisma
    res.json({
      success: true,
      message: "Customer debt endpoint - Coming soon",
      data: [],
    });
  })
);

// POST /api/debt/payment - Pembayaran utang
router.post(
  "/payment",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Implement dengan Prisma dan update debt status
    res.json({
      success: true,
      message: "Debt payment endpoint - Coming soon",
      data: null,
    });
  })
);

// GET /api/debt/summary - Ringkasan total utang
router.get(
  "/summary",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Implement dengan Prisma
    res.json({
      success: true,
      message: "Debt summary endpoint - Coming soon",
      data: {
        totalDebt: 0,
        totalCustomers: 0,
        overdueDebt: 0,
      },
    });
  })
);

export default router;
