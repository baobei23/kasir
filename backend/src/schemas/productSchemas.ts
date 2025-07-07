import { z } from "zod";

// Schema untuk ProductUnit
export const productUnitSchema = z.object({
  name: z.string().min(1, "Nama unit tidak boleh kosong"),
  price: z.number().positive("Harga harus lebih dari 0"),
  conversionRate: z.number().positive("Conversion rate harus lebih dari 0"),
  isBaseUnit: z.boolean().default(false),
});

// Schema untuk create product
export const createProductSchema = z.object({
  name: z.string().min(1, "Nama produk tidak boleh kosong"),
  sku: z.string().min(1, "SKU tidak boleh kosong"),
  categoryId: z.string().min(1, "Category ID tidak boleh kosong"),
  cost: z.number().nonnegative("Cost tidak boleh negatif"),
  stock: z.number().int().nonnegative("Stok tidak boleh negatif").default(0),
  minStock: z
    .number()
    .int()
    .nonnegative("Min stock tidak boleh negatif")
    .default(0),
  baseUnit: z.string().min(1, "Base unit tidak boleh kosong"),
  supplierId: z.string().optional(),
  description: z.string().optional(),
  units: z.array(productUnitSchema).min(1, "Minimal harus ada 1 unit"),
});

// Schema untuk update product
export const updateProductSchema = createProductSchema.partial().extend({
  units: z
    .array(
      productUnitSchema.extend({
        id: z.string().optional(), // untuk update existing units
      })
    )
    .optional(),
});

// Schema untuk query parameters
export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  lowStock: z.coerce.boolean().optional(),
  sortBy: z.enum(["name", "sku", "stock", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Schema untuk stock adjustment
export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, "Product ID tidak boleh kosong"),
  quantity: z.number().int("Quantity harus berupa integer"),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  notes: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
