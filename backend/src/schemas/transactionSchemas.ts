import { z } from "zod";

// Schema untuk transaction item
export const transactionItemSchema = z.object({
  productId: z.string().min(1, "Product ID tidak boleh kosong"),
  unitName: z.string().min(1, "Unit name tidak boleh kosong"),
  quantity: z.number().positive("Quantity harus lebih dari 0"),
  price: z.number().positive("Price harus lebih dari 0"),
  subtotal: z.number().positive("Subtotal harus lebih dari 0"),
});

// Schema untuk create transaction
export const createTransactionSchema = z
  .object({
    customerName: z.string().min(1, "Nama customer tidak boleh kosong"),
    customerPhone: z.string().optional(),
    paymentMethod: z.enum(["CASH", "DEBT"], {
      required_error: "Payment method wajib diisi",
    }),
    paidAmount: z
      .number()
      .nonnegative("Paid amount tidak boleh negatif")
      .default(0),
    notes: z.string().optional(),
    items: z
      .array(transactionItemSchema)
      .min(1, "Transaksi harus memiliki minimal 1 item"),
  })
  .refine(
    (data) => {
      // Validasi: jika CASH, paidAmount harus >= total
      // Total akan dihitung dari items
      const total = data.items.reduce((sum, item) => sum + item.subtotal, 0);

      if (data.paymentMethod === "CASH" && data.paidAmount < total) {
        return false;
      }
      return true;
    },
    {
      message: "Untuk pembayaran CASH, jumlah bayar harus >= total",
      path: ["paidAmount"],
    }
  );

// Schema untuk update transaction
export const updateTransactionSchema = z.object({
  customerName: z.string().min(1).optional(),
  customerPhone: z.string().optional(),
  paymentMethod: z.enum(["CASH", "DEBT"]).optional(),
  paidAmount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
});

// Schema untuk query parameters
export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(), // search by customer name atau receipt number
  paymentMethod: z.enum(["CASH", "DEBT"]).optional(),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.enum(["createdAt", "total", "customerName"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Schema untuk payment pada debt transaction
export const addPaymentSchema = z.object({
  amount: z.number().positive("Amount harus lebih dari 0"),
  paymentMethod: z.enum(["CASH", "TRANSFER", "OTHER"]).default("CASH"),
  notes: z.string().optional(),
});

// Schema untuk cancel transaction
export const cancelTransactionSchema = z.object({
  reason: z.string().min(1, "Alasan pembatalan wajib diisi"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
export type AddPaymentInput = z.infer<typeof addPaymentSchema>;
export type CancelTransactionInput = z.infer<typeof cancelTransactionSchema>;
export type TransactionItemInput = z.infer<typeof transactionItemSchema>;
