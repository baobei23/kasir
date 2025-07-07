/**
 * Generate unique receipt number dengan format: TXN-YYYYMMDD-XXX
 * Example: TXN-20241225-001
 */
export function generateReceiptNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = now.getTime().toString().slice(-6); // 6 digit terakhir timestamp

  return `TXN-${dateStr}-${timeStr}`;
}

/**
 * Generate receipt number dengan counter harian
 * Membutuhkan input counter dari database
 */
export function generateReceiptNumberWithCounter(dailyCounter: number): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const counterStr = dailyCounter.toString().padStart(3, "0");

  return `TXN-${dateStr}-${counterStr}`;
}
