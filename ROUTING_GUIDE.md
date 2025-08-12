# দোকান হিসাব - Page Navigation Guide

## 📱 Main Navigation Routes (Bottom Navigation)

### Core Business Pages
1. **Dashboard (হোম)** - `/`
   - Main business overview with today's stats
   - Quick access to all features

2. **Transactions (লেনদেন)** - `/transactions`
   - All sales, collections, and transactions
   - Complete transaction history

3. **Customers (গ্রাহক)** - `/customers`
   - Customer list and management
   - Credit tracking and customer details

4. **Reports (রিপোর্ট)** - `/reports`
   - Business reports and analytics
   - Profit/loss analysis

5. **Settings (সেটিংস)** - `/settings`
   - App configuration and business settings
   - User preferences

## 🔧 Feature Pages (Accessible from Dashboard and Other Pages)

### Sales & Customer Management
- **New Sale** - `/sales/new`
- **Add Customer** - `/customers/new`  
- **Customer Details** - `/customers/{customer-id}`

### Inventory & Stock
- **Inventory Management** - `/inventory`
- **Smart Inventory (AI)** - `/smart-inventory`

### Financial Management
- **Add Expense** - `/expenses/new`
- **Collection Management** - `/collection`

### Advanced Features
- **Analytics Dashboard** - `/analytics`
- **Loyalty Program** - `/loyalty`

## 🎯 How to Access Pages

### Method 1: Bottom Navigation (Always Visible)
The bottom navigation bar has 5 main tabs:
- 🏠 হোম (Home) → Dashboard
- 📊 লেনদেন (Transactions) 
- 👥 গ্রাহক (Customers)
- 📈 রিপোর্ট (Reports)
- ⚙️ সেটিংস (Settings)

### Method 2: Dashboard Quick Actions
From the dashboard, you can access:
- Sales Entry (বিক্রয় এন্ট্রি)
- Customer Management (গ্রাহক ব্যবস্থাপনা)
- Inventory (স্টক দেখুন)
- Analytics (বিশ্লেষণ)

### Method 3: Direct URL Navigation
You can navigate directly by typing URLs:
```
http://localhost:5000/analytics          # Analytics page
http://localhost:5000/smart-inventory    # Smart Inventory
http://localhost:5000/loyalty           # Loyalty Program
http://localhost:5000/inventory         # Regular Inventory
```

### Method 4: Page-to-Page Navigation
Most pages have:
- Back buttons (← arrow) to return to previous page
- Quick action buttons to related features
- Contextual navigation within workflows

## 🚀 Quick Access Examples

### To reach Analytics:
1. Dashboard → Analytics button, OR
2. Direct URL: `/analytics`

### To reach Smart Inventory:
1. Dashboard → Inventory → Smart Inventory link, OR
2. Direct URL: `/smart-inventory`

### To reach Loyalty Program:
1. Customers page → Loyalty button, OR
2. Direct URL: `/loyalty`

## 📋 Navigation Features
- **Back Navigation**: All pages have back arrows
- **Breadcrumbs**: Context-aware navigation trails  
- **Quick Actions**: Fast access to related features
- **Bottom Navigation**: Always-visible main tabs
- **Touch-Optimized**: All navigation is mobile-friendly

All routes are now mobile-optimized with Bengali language support!