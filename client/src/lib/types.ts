// Database types for the Bengali business management app
export interface User {
  id: string;
  username: string;
  password: string;
  shopName: string;
  ownerName: string;
  phoneNumber?: string;
  address?: string;
  createdAt?: Date;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  phoneNumber?: string;
  address?: string;
  totalCredit: string;
  createdAt?: Date;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  category?: string;
  unit: string;
  buyingPrice: string;
  sellingPrice: string;
  currentStock: number;
  minStockLevel: number;
  createdAt?: Date;
}

export interface Sale {
  id: string;
  userId: string;
  customerId?: string;
  customerName: string;
  totalAmount: string;
  paidAmount: string;
  dueAmount: string;
  paymentMethod: string;
  items: any[];
  saleDate?: Date;
  createdAt?: Date;
}

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: string;
  category: string;
  expenseDate?: Date;
  createdAt?: Date;
}

export interface Collection {
  id: string;
  userId: string;
  customerId: string;
  saleId?: string;
  amount: string;
  collectionDate?: Date;
  createdAt?: Date;
}

// Insert types (for creating new records)
export interface InsertUser {
  username: string;
  password: string;
  shopName: string;
  ownerName: string;
  phoneNumber?: string;
  address?: string;
}

export interface InsertCustomer {
  name: string;
  phoneNumber?: string;
  address?: string;
}

export interface InsertProduct {
  name: string;
  category?: string;
  unit: string;
  buyingPrice: string;
  sellingPrice: string;
  currentStock?: number;
  minStockLevel?: number;
}

export interface InsertSale {
  customerId?: string;
  customerName: string;
  totalAmount: string;
  paidAmount: string;
  dueAmount: string;
  paymentMethod: string;
  items: any[];
}

export interface InsertExpense {
  description: string;
  amount: string;
  category: string;
}

export interface InsertCollection {
  customerId: string;
  saleId?: string;
  amount: string;
}