// Database types
export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  cost: number;
  stock: number;
  minStock: number;
  baseUnit: string;
  supplierId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductUnit {
  id: string;
  productId: string;
  name: string;
  price: number;
  conversionRate: number;
  isBaseUnit: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  address?: string;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  customerName?: string;
  customerAddress?: string;
  totalAmount: number;
  paymentAmount: number;
  changeAmount: number;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  unitId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DebtRecord {
  id: string;
  transactionId: string;
  customerName: string;
  totalDebt: number;
  paidAmount: number;
  remainingDebt: number;
  status: "PENDING" | "PARTIAL" | "PAID";
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  referenceId?: string; // Transaction ID or adjustment ID
  notes?: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request types
export interface CreateProductRequest {
  name: string;
  sku: string;
  categoryId: string;
  cost: number;
  stock: number;
  minStock: number;
  baseUnit: string;
  supplierId?: string;
  description?: string;
  units: Omit<ProductUnit, "id" | "productId">[];
}

export interface CreateTransactionRequest {
  customerName?: string;
  customerAddress?: string;
  items: {
    productId: string;
    unitId: string;
    quantity: number;
  }[];
  paymentAmount: number;
  isPaid: boolean;
}

export interface StockAdjustmentRequest {
  productId: string;
  quantity: number;
  type: "IN" | "OUT" | "ADJUSTMENT";
  notes?: string;
}

export interface DebtPaymentRequest {
  debtId: string;
  paymentAmount: number;
}
