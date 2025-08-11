import { useQuery } from "@tanstack/react-query";
import DashboardCard from "@/components/ui/dashboard-card";
import TransactionItem from "@/components/ui/transaction-item";
import SalesModal from "@/components/ui/sales-modal";
import { toBengaliNumber, formatCurrency, getBengaliDate, getBengaliTime } from "@/lib/bengali-utils";
import { useState } from "react";
import { Link } from "wouter";

// Mock user ID for demo - in real app this would come from auth
const DEMO_USER_ID = "demo-user-123";

export default function Dashboard() {
  const [showSalesModal, setShowSalesModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard', DEMO_USER_ID],
  });

  const { data: recentSales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['/api/sales', DEMO_USER_ID],
    queryFn: () => fetch(`/api/sales/${DEMO_USER_ID}?limit=3`).then(res => res.json()),
  });

  const { data: lowStockProducts = [], isLoading: stockLoading } = useQuery({
    queryKey: ['/api/products', DEMO_USER_ID, 'low-stock'],
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Status Bar */}
      <div className="status-bar">
        <div className="flex items-center space-x-1">
          <i className="fas fa-signal text-xs"></i>
          <span>{getBengaliTime()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <i className="fas fa-wifi text-xs"></i>
          <i className="fas fa-battery-three-quarters text-xs"></i>
        </div>
      </div>

      {/* Header Bar */}
      <div className="header-bar">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">আজকের হিসাব</h1>
            <p className="text-sm text-green-100">{getBengaliDate()}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <i className="fas fa-cloud text-green-100"></i>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full"></div>
            </div>
            <div className="relative">
              <i className="fas fa-bell text-white"></i>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center text-xs number-font">
                {toBengaliNumber(3)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20 px-4 py-4">
        {/* Dashboard Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <DashboardCard
            title="আজকের বিক্রয়"
            value={formatCurrency(stats?.todaySales || 0)}
            unit="টাকা"
            icon="fas fa-chart-line"
            color="primary"
            isLoading={statsLoading}
          />
          <DashboardCard
            title="আজকের লাভ"
            value={formatCurrency(stats?.todayProfit || 0)}
            unit="টাকা"
            icon="fas fa-coins"
            color="success"
            isLoading={statsLoading}
          />
          <DashboardCard
            title="বাকি আদায়"
            value={formatCurrency(stats?.pendingCollection || 0)}
            unit="টাকা"
            icon="fas fa-clock"
            color="warning"
            isLoading={statsLoading}
          />
          <DashboardCard
            title="মোট গ্রাহক"
            value={toBengaliNumber(stats?.totalCustomers || 0)}
            unit="জন"
            icon="fas fa-users"
            color="secondary"
            isLoading={statsLoading}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg card-shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-bolt text-accent mr-2"></i>
            দ্রুত কাজ
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              className="bg-primary quick-action-btn"
              onClick={() => setShowSalesModal(true)}
            >
              <i className="fas fa-plus-circle text-xl"></i>
              <span className="text-sm font-medium">নতুন বিক্রয়</span>
            </button>
            <Link to="/customers/new">
              <button className="bg-secondary quick-action-btn w-full">
                <i className="fas fa-user-plus text-xl"></i>
                <span className="text-sm font-medium">নতুন গ্রাহক</span>
              </button>
            </Link>
            <button className="bg-success quick-action-btn">
              <i className="fas fa-money-bill-wave text-xl"></i>
              <span className="text-sm font-medium">বাকি আদায়</span>
            </button>
            <button className="bg-warning quick-action-btn">
              <i className="fas fa-minus-circle text-xl"></i>
              <span className="text-sm font-medium">খরচ এন্ট্রি</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg card-shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <i className="fas fa-history text-primary mr-2"></i>
              সাম্প্রতিক লেনদেন
            </h2>
            <Link to="/sales" className="text-primary text-sm font-medium">
              সব দেখুন
            </Link>
          </div>

          <div className="space-y-3">
            {salesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse transaction-item">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-200 p-2 rounded-full w-8 h-8"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentSales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-receipt text-3xl mb-2 text-gray-300"></i>
                <p>আজ এখনো কোনো লেনদেন হয়নি</p>
              </div>
            ) : (
              recentSales.map((sale: any) => (
                <TransactionItem
                  key={sale.id}
                  customerName={sale.customerName}
                  time={getBengaliTime(new Date(sale.createdAt))}
                  amount={`+ ${formatCurrency(parseFloat(sale.totalAmount))} টাকা`}
                  type={sale.paymentMethod}
                  icon="fas fa-shopping-cart"
                  iconColor="primary"
                />
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="bg-white rounded-lg card-shadow p-4 mb-6 border-l-4 border-error">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center text-error">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                স্টক শেষ হয়ে যাচ্ছে
              </h2>
              <span className="bg-error text-white text-xs px-2 py-1 rounded-full number-font">
                {toBengaliNumber(lowStockProducts.length)}
              </span>
            </div>
            
            <div className="space-y-2">
              {lowStockProducts.slice(0, 3).map((product: any) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span>{product.name}</span>
                  <span className="text-error font-medium number-font">
                    {toBengaliNumber(product.currentStock)} টি বাকি
                  </span>
                </div>
              ))}
            </div>
            
            <Link to="/inventory">
              <button className="w-full mt-3 bg-error text-white py-2 rounded-lg text-sm font-medium active:bg-error/90 transition-colors">
                সব পণ্য দেখুন
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        className="floating-action-btn"
        onClick={() => setShowSalesModal(true)}
      >
        <i className="fas fa-plus text-xl"></i>
      </button>

      {/* Sales Modal */}
      <SalesModal 
        isOpen={showSalesModal} 
        onClose={() => setShowSalesModal(false)} 
      />
    </>
  );
}
