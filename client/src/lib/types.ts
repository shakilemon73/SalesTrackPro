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
  user_id: string;
  name: string;
  phone_number?: string;
  address?: string;
  total_credit: string;
  created_at?: Date;
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
  user_id: string;
  customer_id?: string;
  customer_name: string;
  total_amount: string;
  paid_amount: string;
  due_amount: string;
  payment_method: string;
  items: any[];
  sale_date?: Date;
  created_at?: Date;
}

export interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: string;
  category: string;
  expense_date?: Date;
  created_at?: Date;
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
  phone_number?: string;
  address?: string;
  total_credit?: string;
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
  customer_id?: string;
  customer_name: string;
  total_amount: string;
  paid_amount: string;
  due_amount: string;
  payment_method: string;
  items: any[];
}

export interface InsertExpense {
  description: string;
  amount: number;
  category: string;
  expense_date?: string;
}

export interface InsertCollection {
  customer_id: string;
  sale_id?: string;
  amount: number;
  collection_date?: string;
  notes?: string;
}