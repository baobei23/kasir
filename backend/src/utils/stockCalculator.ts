import { ProductUnit } from "@prisma/client";

/**
 * Kalkulasi quantity dalam base unit berdasarkan unit yang dipilih
 */
export function calculateBaseQuantity(
  quantity: number,
  selectedUnit: ProductUnit
): number {
  return quantity * Number(selectedUnit.conversionRate);
}

/**
 * Kalkulasi quantity dalam unit tertentu dari base quantity
 */
export function calculateUnitQuantity(
  baseQuantity: number,
  targetUnit: ProductUnit
): number {
  return baseQuantity / Number(targetUnit.conversionRate);
}

/**
 * Validasi apakah stok mencukupi untuk transaksi
 */
export function validateStockAvailability(
  currentStock: number,
  requestedQuantity: number,
  selectedUnit: ProductUnit
): boolean {
  const requiredBaseQuantity = calculateBaseQuantity(
    requestedQuantity,
    selectedUnit
  );
  return currentStock >= requiredBaseQuantity;
}

/**
 * Hitung total harga berdasarkan quantity dan unit price
 */
export function calculateTotalPrice(
  quantity: number,
  unitPrice: number
): number {
  return quantity * unitPrice;
}

/**
 * Format currency ke Rupiah
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Validasi minimum stock dan return status
 */
export function getStockStatus(
  currentStock: number,
  minStock: number
): "NORMAL" | "LOW" | "CRITICAL" {
  if (currentStock <= 0) return "CRITICAL";
  if (currentStock <= minStock) return "CRITICAL";
  if (currentStock <= minStock * 2) return "LOW";
  return "NORMAL";
}
