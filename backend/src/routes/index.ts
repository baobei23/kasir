import { Router, Request, Response } from "express";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import transactionsRouter from "./transactions";
import stockRouter from "./stock";
import debtRouter from "./debt";
import analyticsRouter from "./analytics";

const router = Router();

// API Routes
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/transactions", transactionsRouter);
router.use("/stock", stockRouter);
router.use("/debt", debtRouter);
router.use("/analytics", analyticsRouter);

// Health Check
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API is running properly",
    endpoints: {
      products: "/api/products",
      categories: "/api/categories",
      transactions: "/api/transactions",
      stock: "/api/stock",
      debt: "/api/debt",
      analytics: "/api/analytics",
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
