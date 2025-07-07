import { prisma } from "@/lib/prisma";
import { AppError } from "@/middleware/errorHandler";

export interface CreateCategoryInput {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
}

export class CategoryService {
  /**
   * Get all categories with product count
   */
  async getCategories() {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories.map((category) => ({
      ...category,
      productCount: category._count.products,
    }));
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            stock: true,
            minStock: true,
          },
          orderBy: { name: "asc" },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new AppError("Kategori tidak ditemukan", 404);
    }

    return {
      ...category,
      productCount: category._count.products,
    };
  }

  /**
   * Create new category
   */
  async createCategory(data: CreateCategoryInput) {
    // Check if category name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existingCategory) {
      throw new AppError("Nama kategori sudah digunakan", 400);
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description || null,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return {
      ...category,
      productCount: category._count.products,
    };
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: UpdateCategoryInput) {
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new AppError("Kategori tidak ditemukan", 404);
    }

    // Check name uniqueness if updating name
    if (data.name && data.name !== existingCategory.name) {
      const duplicateName = await prisma.category.findUnique({
        where: { name: data.name },
      });

      if (duplicateName) {
        throw new AppError("Nama kategori sudah digunakan", 400);
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description || null;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return {
      ...updatedCategory,
      productCount: updatedCategory._count.products,
    };
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new AppError("Kategori tidak ditemukan", 404);
    }

    // Check if category has products
    if (category._count.products > 0) {
      throw new AppError(
        "Tidak dapat menghapus kategori yang memiliki produk",
        400
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return { message: "Kategori berhasil dihapus" };
  }
}
