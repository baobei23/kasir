import { prisma } from "@/lib/prisma";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
  StockAdjustmentInput,
} from "@/schemas/productSchemas";
import { AppError } from "@/middleware/errorHandler";

export class ProductService {
  /**
   * Get all products with filtering, searching and pagination
   */
  async getProducts(query: ProductQueryInput) {
    const {
      page,
      limit,
      search,
      categoryId,
      supplierId,
      lowStock,
      sortBy,
      sortOrder,
    } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    // Get products with relations
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          supplier: true,
          units: {
            orderBy: { isBaseUnit: "desc" },
          },
          _count: {
            select: { transactionItems: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Filter low stock after querying if needed
    let filteredProducts = products;
    if (lowStock) {
      filteredProducts = products.filter(
        (product) => product.stock <= product.minStock
      );
    }

    // Add stock status to each product
    const productsWithStatus = filteredProducts.map((product) => ({
      ...product,
      stockStatus: this.getStockStatus(product.stock, product.minStock),
      hasTransactions: product._count.transactionItems > 0,
    }));

    return {
      products: productsWithStatus,
      pagination: {
        page,
        limit,
        total: lowStock ? filteredProducts.length : total,
        totalPages: Math.ceil(
          (lowStock ? filteredProducts.length : total) / limit
        ),
      },
    };
  }

  /**
   * Get single product by ID
   */
  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        units: {
          orderBy: { isBaseUnit: "desc" },
        },
        stockMovements: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { transactionItems: true },
        },
      },
    });

    if (!product) {
      throw new AppError("Produk tidak ditemukan", 404);
    }

    return {
      ...product,
      stockStatus: this.getStockStatus(product.stock, product.minStock),
      hasTransactions: product._count.transactionItems > 0,
    };
  }

  /**
   * Create new product with units
   */
  async createProduct(data: CreateProductInput) {
    // Validate SKU uniqueness
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new AppError("SKU sudah digunakan", 400);
    }

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new AppError("Kategori tidak ditemukan", 404);
    }

    // Validate supplier exists (if provided)
    if (data.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: data.supplierId },
      });

      if (!supplier) {
        throw new AppError("Supplier tidak ditemukan", 404);
      }
    }

    // Validate units - must have exactly one base unit
    const baseUnits = data.units.filter((unit) => unit.isBaseUnit);
    if (baseUnits.length !== 1) {
      throw new AppError("Harus ada tepat 1 unit sebagai base unit", 400);
    }

    // Create product with units in transaction
    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        categoryId: data.categoryId,
        cost: data.cost,
        stock: data.stock,
        minStock: data.minStock,
        baseUnit: data.baseUnit,
        supplierId: data.supplierId || null,
        description: data.description || null,
        units: {
          create: data.units,
        },
      },
      include: {
        category: true,
        supplier: true,
        units: true,
      },
    });

    // Create initial stock movement if stock > 0
    if (data.stock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: "IN",
          quantity: data.stock,
          notes: "Initial stock",
        },
      });
    }

    return product;
  }

  /**
   * Update existing product
   */
  async updateProduct(id: string, data: UpdateProductInput) {
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { units: true, _count: { select: { transactionItems: true } } },
    });

    if (!existingProduct) {
      throw new AppError("Produk tidak ditemukan", 404);
    }

    // Check if product has transactions - restrict certain updates
    const hasTransactions = existingProduct._count.transactionItems > 0;

    if (hasTransactions && data.sku && data.sku !== existingProduct.sku) {
      throw new AppError(
        "Tidak dapat mengubah SKU produk yang sudah memiliki transaksi",
        400
      );
    }

    // Validate SKU uniqueness if changing
    if (data.sku && data.sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (existingSku) {
        throw new AppError("SKU sudah digunakan", 400);
      }
    }

    // Validate category if changing
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new AppError("Kategori tidak ditemukan", 404);
      }
    }

    // Validate supplier if changing
    if (data.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: data.supplierId },
      });

      if (!supplier) {
        throw new AppError("Supplier tidak ditemukan", 404);
      }
    }

    // Update product
    const updateData: any = { ...data };
    delete updateData.units; // Handle units separately

    // Fix null/undefined issues
    if (data.supplierId !== undefined) {
      updateData.supplierId = data.supplierId || null;
    }
    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        supplier: true,
        units: true,
      },
    });

    // Handle units update if provided
    if (data.units) {
      // Delete existing units and create new ones (simpler approach)
      await prisma.productUnit.deleteMany({
        where: { productId: id },
      });

      await prisma.productUnit.createMany({
        data: data.units.map((unit) => ({
          name: unit.name,
          price: unit.price,
          conversionRate: unit.conversionRate,
          isBaseUnit: unit.isBaseUnit,
          productId: id,
        })),
      });
    }

    return updatedProduct;
  }

  /**
   * Delete product (soft delete if has transactions)
   */
  async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { transactionItems: true },
        },
      },
    });

    if (!product) {
      throw new AppError("Produk tidak ditemukan", 404);
    }

    // Check if product has transactions
    if (product._count.transactionItems > 0) {
      throw new AppError(
        "Tidak dapat menghapus produk yang sudah memiliki transaksi",
        400
      );
    }

    // Delete product and related data
    await prisma.$transaction([
      prisma.stockMovement.deleteMany({ where: { productId: id } }),
      prisma.productUnit.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    return { message: "Produk berhasil dihapus" };
  }

  /**
   * Adjust product stock
   */
  async adjustStock(data: StockAdjustmentInput) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new AppError("Produk tidak ditemukan", 404);
    }

    const newStock = product.stock + data.quantity;

    if (newStock < 0) {
      throw new AppError("Stok tidak boleh negatif", 400);
    }

    // Update stock and create movement record
    const [updatedProduct] = await prisma.$transaction([
      prisma.product.update({
        where: { id: data.productId },
        data: { stock: newStock },
      }),
      prisma.stockMovement.create({
        data: {
          productId: data.productId,
          type: data.type,
          quantity: data.quantity,
          notes: data.notes || `Stock ${data.type.toLowerCase()} adjustment`,
        },
      }),
    ]);

    return {
      ...updatedProduct,
      previousStock: product.stock,
      newStock,
      stockStatus: this.getStockStatus(newStock, product.minStock),
    };
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts() {
    // Get all products and filter manually for low stock
    const allProducts = await prisma.product.findMany({
      include: {
        category: true,
        units: {
          where: { isBaseUnit: true },
        },
      },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
    });

    const lowStockProducts = allProducts.filter(
      (product) => product.stock <= product.minStock
    );

    return lowStockProducts.map((product) => ({
      ...product,
      stockStatus: this.getStockStatus(product.stock, product.minStock),
      urgencyLevel:
        product.stock === 0
          ? "CRITICAL"
          : product.stock <= Math.floor(product.minStock / 2)
          ? "HIGH"
          : "MEDIUM",
    }));
  }

  /**
   * Get product statistics
   */
  async getProductStats() {
    const [totalProducts, outOfStockCount, totalStockValue] = await Promise.all(
      [
        prisma.product.count(),
        prisma.product.count({
          where: { stock: 0 },
        }),
        prisma.product.aggregate({
          _sum: {
            stock: true,
          },
        }),
      ]
    );

    // Get low stock count manually
    const allProducts = await prisma.product.findMany({
      select: { stock: true, minStock: true },
    });
    const lowStockCount = allProducts.filter(
      (p) => p.stock <= p.minStock
    ).length;

    // Get categories breakdown
    const categoriesBreakdown = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalStockValue: totalStockValue._sum.stock || 0,
      categoriesBreakdown: categoriesBreakdown.map((cat) => ({
        categoryId: cat.id,
        name: cat.name,
        _count: cat._count.products,
      })),
    };
  }

  /**
   * Helper method to determine stock status
   */
  private getStockStatus(
    currentStock: number,
    minStock: number
  ): "NORMAL" | "LOW" | "CRITICAL" {
    if (currentStock <= 0) return "CRITICAL";
    if (currentStock <= minStock) return "CRITICAL";
    if (currentStock <= minStock * 2) return "LOW";
    return "NORMAL";
  }
}
