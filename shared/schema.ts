import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  shopName: text("shop_name").notNull(),
  ownerName: text("owner_name").notNull(),
  phoneNumber: text("phone_number"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number"),
  address: text("address"),
  totalCredit: decimal("total_credit", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  category: text("category"),
  unit: text("unit").notNull(),
  buyingPrice: decimal("buying_price", { precision: 12, scale: 2 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 12, scale: 2 }).notNull(),
  currentStock: integer("current_stock").default(0),
  minStockLevel: integer("min_stock_level").default(5),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sales = pgTable("sales", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  customerId: uuid("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).notNull(),
  dueAmount: decimal("due_amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // 'নগদ', 'বাকি', 'মিশ্র'
  items: jsonb("items").notNull(), // Array of {productId, productName, quantity, unitPrice, totalPrice}
  saleDate: timestamp("sale_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  expenseDate: timestamp("expense_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  saleId: uuid("sale_id").references(() => sales.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  collectionDate: timestamp("collection_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  shopName: true,
  ownerName: true,
  phoneNumber: true,
  address: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  phoneNumber: true,
  address: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  category: true,
  unit: true,
  buyingPrice: true,
  sellingPrice: true,
  currentStock: true,
  minStockLevel: true,
});

export const insertSaleSchema = createInsertSchema(sales).pick({
  customerId: true,
  customerName: true,
  totalAmount: true,
  paidAmount: true,
  dueAmount: true,
  paymentMethod: true,
  items: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  description: true,
  amount: true,
  category: true,
});

export const insertCollectionSchema = createInsertSchema(collections).pick({
  customerId: true,
  saleId: true,
  amount: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Collection = typeof collections.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
