"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  ArrowUpRight, 
  TrendingUp,
  Activity,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  // 1. Khởi tạo state với giá trị mặc định là 0 để tránh lỗi .toFixed()
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    topCustomers: []
  });
  const [loading, setLoading] = useState(true);

  // 2. Gọi API lấy dữ liệu thực từ PostgreSQL
  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          revenue: data.revenue || 0,
          orders: data.orders || 0,
          customers: data.customers || 0,
          topCustomers: data.topCustomers || []
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch stats:", err);
        setLoading(false);
      });
  }, []);

  // Tính toán giá trị trung bình đơn hàng
  const avgOrderValue = stats.orders > 0 ? stats.revenue / stats.orders : 0;

  // Cấu hình các thẻ thống kê nhanh
  const summaryCards = [
    { 
      title: "Total Revenue", 
      value: `$${(Number(stats.revenue) || 0).toFixed(2)}`, 
      icon: DollarSign, 
      color: "text-green-500",
      desc: "+12.5% from last month" 
    },
    { 
      title: "Total Orders", 
      value: stats.orders, 
      icon: ShoppingCart, 
      color: "text-yellow-500",
      desc: "+8.2% from last month" 
    },
    { 
      title: "Active Customers", 
      value: stats.customers, 
      icon: Users, 
      color: "text-blue-500",
      desc: "+4.1% from last month" 
    },
    { 
      title: "Avg. Order Value", 
      value: `$${(Number(avgOrderValue) || 0).toFixed(2)}`, 
      icon: TrendingUp, 
      color: "text-red-500",
      desc: "Based on real-time data" 
    },
  ];

  if (loading) {
    return <div className="p-8 text-white italic animate-pulse">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-8 p-2">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Overview<span className="text-red-600">.</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Welcome back, Admin. Here is what's happening today.</p>
        </div>
        <div className="hidden md:block bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg">
           <p className="text-[10px] uppercase font-bold text-zinc-500">System Status</p>
           <p className="text-xs text-green-500 font-bold flex items-center gap-2">
             <Activity className="h-3 w-3" /> Live Database Connected
           </p>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className="bg-[#0a0a0a] border-zinc-800 shadow-none hover:border-zinc-700 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-white">{card.value}</div>
              <p className="text-[10px] text-zinc-600 mt-1 font-medium">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Recent Activity / Top Customers Preview */}
        <Card className="md:col-span-4 bg-[#0a0a0a] border-zinc-800 shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase text-white flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-red-600" /> Top Customers by Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.topCustomers.length > 0 ? (
                stats.topCustomers.map((customer: any, i: number) => (
                  <div key={i} className="flex items-center justify-between border-b border-zinc-900 pb-4 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-zinc-400 border border-zinc-800">
                        {customer.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-none">{customer.full_name}</p>
                        <p className="text-xs text-zinc-500 mt-1">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-green-500">${Number(customer.total_spent).toFixed(2)}</p>
                      <p className="text-[10px] text-zinc-600 uppercase font-bold">{customer.order_count} Orders</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-600 italic text-sm py-10 text-center">No customer data available yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links / Actions */}
        <Card className="md:col-span-3 bg-[#0a0a0a] border-zinc-800 shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <QuickActionButton label="Manage Inventory" href="/admin/products" />
            <QuickActionButton label="Review Recent Orders" href="/admin/orders" />
            <QuickActionButton label="Customer Analytics" href="/admin/customers" />
            <QuickActionButton label="View Detailed Reports" href="/admin/stats" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Component con cho các nút nhanh
function QuickActionButton({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900 transition-all group">
      <span className="text-xs font-bold text-zinc-400 group-hover:text-white uppercase tracking-wider">{label}</span>
      <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-red-600" />
    </a>
  );
}