import { Router, Request, Response } from "express";
import { asyncHandler } from "@/middleware/errorHandler";

const router = Router();

// GET /api/stock - Ambil laporan stok
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Implement dengan Prisma
    res.json({
      success: true,
      message: "Stock report endpoint - Coming soon",
      data: [],
    });
  })
);

// GET /api/stock/low-stock - Produk dengan stok menipis
router.get(
  "/low-stock",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Implement dengan Prisma
    res.json({
      success: true,
      message: "Low stock products endpoint - Coming soon",
      data: [],
    });
  })
);

// POST /api/stock/adjustment - Penyesuaian stok manual
router.post(
  "/adjustment",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Implement dengan Prisma dan stock movement tracking
    res.json({
      success: true,
      message: "Stock adjustment endpoint - Coming soon",
      data: null,
    });
  })
);

// GET /api/stock/movements - Riwayat pergerakan stok
router.get(
  "/movements",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Implement dengan Prisma
    res.json({
      success: true,
      message: "Stock movements endpoint - Coming soon",
      data: [],
    });
  })
);

export default router;
