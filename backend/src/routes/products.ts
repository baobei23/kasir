import { Router, Request, Response } from "express";
import { asyncHandler } from "@/middleware/errorHandler";
import { ProductService } from "@/services/productService";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  stockAdjustmentSchema,
} from "@/schemas/productSchemas";

const router = Router();
const productService = new ProductService();

// GET /api/products - Ambil semua produk dengan filter
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const query = productQuerySchema.parse(req.query);
    const result = await productService.getProducts(query);

    res.json({
      success: true,
      message: "Produk berhasil diambil",
      data: result.products,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  })
);

// GET /api/products/stats - Statistik produk
router.get(
  "/stats",
  asyncHandler(async (_req: Request, res: Response) => {
    const stats = await productService.getProductStats();

    res.json({
      success: true,
      message: "Statistik produk berhasil diambil",
      data: stats,
      timestamp: new Date().toISOString(),
    });
  })
);

// GET /api/products/low-stock - Produk dengan stok menipis
router.get(
  "/low-stock",
  asyncHandler(async (_req: Request, res: Response) => {
    const products = await productService.getLowStockProducts();

    res.json({
      success: true,
      message: "Produk stok menipis berhasil diambil",
      data: products,
      timestamp: new Date().toISOString(),
    });
  })
);

// GET /api/products/:id - Ambil produk berdasarkan ID
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "ID produk tidak valid",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const product = await productService.getProductById(id);

    res.json({
      success: true,
      message: "Detail produk berhasil diambil",
      data: product,
      timestamp: new Date().toISOString(),
    });
  })
);

// POST /api/products - Tambah produk baru
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createProductSchema.parse(req.body);
    const product = await productService.createProduct(validatedData);

    res.status(201).json({
      success: true,
      message: "Produk berhasil ditambahkan",
      data: product,
      timestamp: new Date().toISOString(),
    });
  })
);

// PUT /api/products/:id - Update produk
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "ID produk tidak valid",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const validatedData = updateProductSchema.parse(req.body);
    const product = await productService.updateProduct(id, validatedData);

    res.json({
      success: true,
      message: "Produk berhasil diperbarui",
      data: product,
      timestamp: new Date().toISOString(),
    });
  })
);

// DELETE /api/products/:id - Hapus produk
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "ID produk tidak valid",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const result = await productService.deleteProduct(id);

    res.json({
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  })
);

// POST /api/products/stock/adjust - Penyesuaian stok
router.post(
  "/stock/adjust",
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = stockAdjustmentSchema.parse(req.body);
    const result = await productService.adjustStock(validatedData);

    res.json({
      success: true,
      message: "Stok berhasil disesuaikan",
      data: result,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
