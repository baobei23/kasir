import { Router, Request, Response } from "express";
import { asyncHandler } from "@/middleware/errorHandler";
import { CategoryService } from "@/services/categoryService";
import { z } from "zod";

const router = Router();
const categoryService = new CategoryService();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, "Nama kategori tidak boleh kosong"),
  description: z.string().optional().nullable(),
});

const updateCategorySchema = createCategorySchema.partial();

// GET /api/categories - Ambil semua kategori
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.getCategories();

    res.json({
      success: true,
      message: "Kategori berhasil diambil",
      data: categories,
      timestamp: new Date().toISOString(),
    });
  })
);

// GET /api/categories/:id - Detail kategori
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "ID kategori tidak valid",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const category = await categoryService.getCategoryById(id);

    res.json({
      success: true,
      message: "Detail kategori berhasil diambil",
      data: category,
      timestamp: new Date().toISOString(),
    });
  })
);

// POST /api/categories - Tambah kategori baru
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const parsedData = createCategorySchema.parse(req.body);
    const validatedData = {
      name: parsedData.name,
      description: parsedData.description || null,
    };
    const category = await categoryService.createCategory(validatedData);

    res.status(201).json({
      success: true,
      message: "Kategori berhasil ditambahkan",
      data: category,
      timestamp: new Date().toISOString(),
    });
  })
);

// PUT /api/categories/:id - Update kategori
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "ID kategori tidak valid",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const parsedData = updateCategorySchema.parse(req.body);
    const validatedData: { name?: string; description?: string | null } = {};

    if (parsedData.name !== undefined) validatedData.name = parsedData.name;
    if (parsedData.description !== undefined)
      validatedData.description = parsedData.description || null;

    const category = await categoryService.updateCategory(id, validatedData);

    res.json({
      success: true,
      message: "Kategori berhasil diperbarui",
      data: category,
      timestamp: new Date().toISOString(),
    });
  })
);

// DELETE /api/categories/:id - Hapus kategori
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "ID kategori tidak valid",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const result = await categoryService.deleteCategory(id);

    res.json({
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
