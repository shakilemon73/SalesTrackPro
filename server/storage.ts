import { 
  type User, 
  type InsertUser, 
  type Customer, 
  type InsertCustomer,
  type Product,
  type InsertProduct,
  type Sale,
  type InsertSale,
  type Expense,
  type InsertExpense,
  type Collection,
  type InsertCollection
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customers
  getCustomers(userId: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(userId: string, customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined>;

  // Products
  getProducts(userId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(userId: string, product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product | undefined>;
  getLowStockProducts(userId: string): Promise<Product[]>;

  // Sales
  getSales(userId: string, limit?: number): Promise<Sale[]>;
  getSale(id: string): Promise<Sale | undefined>;
  createSale(userId: string, sale: InsertSale): Promise<Sale>;
  getTodaySales(userId: string): Promise<Sale[]>;
  getSalesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Sale[]>;

  // Expenses
  getExpenses(userId: string, limit?: number): Promise<Expense[]>;
  createExpense(userId: string, expense: InsertExpense): Promise<Expense>;
  getTodayExpenses(userId: string): Promise<Expense[]>;

  // Collections
  getCollections(userId: string, limit?: number): Promise<Collection[]>;
  createCollection(userId: string, collection: InsertCollection): Promise<Collection>;

  // Dashboard
  getDashboardStats(userId: string): Promise<{
    todaySales: number;
    todayProfit: number;
    pendingCollection: number;
    totalCustomers: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private customers: Map<string, Customer>;
  private products: Map<string, Product>;
  private sales: Map<string, Sale>;
  private expenses: Map<string, Expense>;
  private collections: Map<string, Collection>;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.products = new Map();
    this.sales = new Map();
    this.expenses = new Map();
    this.collections = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Customers
  async getCustomers(userId: string): Promise<Customer[]> {
    return Array.from(this.customers.values()).filter(customer => customer.userId === userId);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(userId: string, insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...insertCustomer,
      id,
      userId,
      totalCredit: "0",
      createdAt: new Date()
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, customerUpdate: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updated = { ...customer, ...customerUpdate };
    this.customers.set(id, updated);
    return updated;
  }

  // Products
  async getProducts(userId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.userId === userId);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(userId: string, insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      userId,
      currentStock: insertProduct.currentStock || 0,
      minStockLevel: insertProduct.minStockLevel || 5,
      createdAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, productUpdate: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updated = { ...product, ...productUpdate };
    this.products.set(id, updated);
    return updated;
  }

  async getLowStockProducts(userId: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => 
        product.userId === userId && 
        product.currentStock <= product.minStockLevel
      );
  }

  // Sales
  async getSales(userId: string, limit?: number): Promise<Sale[]> {
    const userSales = Array.from(this.sales.values())
      .filter(sale => sale.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    
    return limit ? userSales.slice(0, limit) : userSales;
  }

  async getSale(id: string): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async createSale(userId: string, insertSale: InsertSale): Promise<Sale> {
    const id = randomUUID();
    const sale: Sale = {
      ...insertSale,
      id,
      userId,
      saleDate: new Date(),
      createdAt: new Date()
    };
    this.sales.set(id, sale);
    return sale;
  }

  async getTodaySales(userId: string): Promise<Sale[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.sales.values())
      .filter(sale => 
        sale.userId === userId &&
        sale.saleDate >= today &&
        sale.saleDate < tomorrow
      );
  }

  async getSalesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Sale[]> {
    return Array.from(this.sales.values())
      .filter(sale => 
        sale.userId === userId &&
        sale.saleDate >= startDate &&
        sale.saleDate <= endDate
      );
  }

  // Expenses
  async getExpenses(userId: string, limit?: number): Promise<Expense[]> {
    const userExpenses = Array.from(this.expenses.values())
      .filter(expense => expense.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    
    return limit ? userExpenses.slice(0, limit) : userExpenses;
  }

  async createExpense(userId: string, insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = {
      ...insertExpense,
      id,
      userId,
      expenseDate: new Date(),
      createdAt: new Date()
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async getTodayExpenses(userId: string): Promise<Expense[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.expenses.values())
      .filter(expense => 
        expense.userId === userId &&
        expense.expenseDate >= today &&
        expense.expenseDate < tomorrow
      );
  }

  // Collections
  async getCollections(userId: string, limit?: number): Promise<Collection[]> {
    const userCollections = Array.from(this.collections.values())
      .filter(collection => collection.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    
    return limit ? userCollections.slice(0, limit) : userCollections;
  }

  async createCollection(userId: string, insertCollection: InsertCollection): Promise<Collection> {
    const id = randomUUID();
    const collection: Collection = {
      ...insertCollection,
      id,
      userId,
      collectionDate: new Date(),
      createdAt: new Date()
    };
    this.collections.set(id, collection);
    return collection;
  }

  // Dashboard Stats
  async getDashboardStats(userId: string): Promise<{
    todaySales: number;
    todayProfit: number;
    pendingCollection: number;
    totalCustomers: number;
  }> {
    const todaySales = await this.getTodaySales(userId);
    const customers = await this.getCustomers(userId);
    const products = await this.getProducts(userId);

    const todaySalesTotal = todaySales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
    
    // Calculate profit based on buying vs selling price
    let todayProfit = 0;
    for (const sale of todaySales) {
      if (Array.isArray(sale.items)) {
        for (const item of sale.items as any[]) {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const profit = (parseFloat(item.unitPrice) - parseFloat(product.buyingPrice)) * item.quantity;
            todayProfit += profit;
          }
        }
      }
    }

    const pendingCollection = customers.reduce((sum, customer) => sum + parseFloat(customer.totalCredit), 0);

    return {
      todaySales: todaySalesTotal,
      todayProfit,
      pendingCollection,
      totalCustomers: customers.length
    };
  }
}

export const storage = new MemStorage();
