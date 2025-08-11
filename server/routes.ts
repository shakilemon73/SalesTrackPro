import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCustomerSchema, 
  insertProductSchema,
  insertSaleSchema,
  insertExpenseSchema,
  insertCollectionSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Customers
  app.get("/api/customers/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const customers = await storage.getCustomers(userId);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(userId, customerData);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  // Products
  app.get("/api/products/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const products = await storage.getProducts(userId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(userId, productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.get("/api/products/:userId/low-stock", async (req, res) => {
    try {
      const { userId } = req.params;
      const products = await storage.getLowStockProducts(userId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  // Sales
  app.get("/api/sales/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sales = await storage.getSales(userId, limit);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(userId, saleData);
      res.json(sale);
    } catch (error) {
      res.status(400).json({ message: "Invalid sale data" });
    }
  });

  app.get("/api/sales/:userId/today", async (req, res) => {
    try {
      const { userId } = req.params;
      const sales = await storage.getTodaySales(userId);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's sales" });
    }
  });

  // Expenses
  app.get("/api/expenses/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const expenses = await storage.getExpenses(userId, limit);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(userId, expenseData);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Invalid expense data" });
    }
  });

  // Collections
  app.get("/api/collections/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const collections = await storage.getCollections(userId, limit);
      res.json(collections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });

  app.post("/api/collections/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const collectionData = insertCollectionSchema.parse(req.body);
      const collection = await storage.createCollection(userId, collectionData);
      res.json(collection);
    } catch (error) {
      res.status(400).json({ message: "Invalid collection data" });
    }
  });

  // Users
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
