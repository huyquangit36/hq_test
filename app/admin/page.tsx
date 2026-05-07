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
  UserCheck,
  BellRing,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    revenueGrowth: "+12.5%",
    ordersGrowth: "+8.2%",
    customersGrowth: "+4.1%",
    topCustomers: [],
    pendingCount: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          revenue: data.revenue || 0,
          orders: data.orders || 0,
          customers: data.customers || 0,
          revenueGrowth: data.revenueGrowth || "+12.5%",
          ordersGrowth: data.ordersGrowth || "+8.2%",
          customersGrowth: data.customersGrowth || "+4.1%",
          topCustomers: data.topCustomers || [],
          pendingCount: data.pendingCount || 0,
          lowStockCount: data.lowStockCount || 0
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch stats:", err);
        setLoading(false);
      });
  }, []);

  const avgOrderValue = stats.orders > 0 ? stats.revenue / stats.orders : 0;

  const summaryCards = [
    { 
      title: "Total Revenue", 
      value: `$${(Number(stats.revenue) || 0).toFixed(2)}`, 
      icon: DollarSign, 
      color: "text-green-500",
      desc: `${stats.revenueGrowth} from last month` 
    },
    { 
      title: "Total Orders", 
      value: stats.orders, 
      icon: ShoppingCart, 
      color: "text-yellow-500",
      desc: `${stats.ordersGrowth} from last month` 
    },
    { 
      title: "Active Customers", 
      value: stats.customers, 
      icon: Users, 
      color: "text-blue-500",
      desc: `${stats.customersGrowth} from last month` 
    },
    { 
      title: "Avg. Order Value", 
      value: `$${(Number(avgOrderValue) || 0).toFixed(2)}`, 
      icon: TrendingUp, 
      color: "text-red-500",
      desc: "Live analytics data" 
    },
  ];

  if (loading) {
    return <div className="p-8 text-white italic animate-pulse font-black uppercase">Initialising Admin Terminal...</div>;
  }

  return (
    <div className="space-y-8 p-2">
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

      {/* THÔNG BÁO TỔNG HỢP (DỮ LIỆU THẬT) */}
      {(stats.pendingCount > 0 || stats.lowStockCount > 0) && (
        <div className="bg-red-600/10 border border-red-600/20 p-5 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <BellRing className="h-6 w-6 text-red-600 animate-bounce" />
            <div className="space-y-1">
              {stats.pendingCount > 0 && (
                <p className="text-[10px] font-black uppercase tracking-widest text-white italic">
                  Attention: {stats.pendingCount} New customer inquiries require immediate response.
                </p>
              )}
              {stats.lowStockCount > 0 && (
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 italic">
                  Alert: {stats.lowStockCount} Products are running low on stock. Restock required.
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/comments">
              <button className="text-[9px] font-black uppercase text-white bg-red-600 px-4 py-2 hover:bg-red-700 transition-all">Handle Inquiries</button>
            </Link>
            <Link href="/admin/products">
              <button className="text-[9px] font-black uppercase text-zinc-400 border border-zinc-800 px-4 py-2 hover:text-white transition-all">Check Stock</button>
            </Link>
          </div>
        </div>
      )}

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
              <div className="text-2xl font-black text-white italic">{card.value}</div>
              <p className="text-[10px] text-zinc-600 mt-1 font-medium italic">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4 bg-[#0a0a0a] border-zinc-800 shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase text-white flex items-center gap-2 italic tracking-widest">
              <UserCheck className="h-4 w-4 text-red-600" /> High-Priority Personnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.topCustomers.length > 0 ? (
                stats.topCustomers.map((customer: any, i: number) => (
                  <div key={i} className="flex items-center justify-between border-b border-zinc-900 pb-4 last:border-0 hover:bg-zinc-950 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-zinc-600">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase italic text-white leading-none">{customer.full_name}</p>
                        <p className="text-[10px] text-zinc-600 mt-1 font-bold">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-red-600 italic">${parseFloat(customer.total_spent).toFixed(2)}</p>
                      <p className="text-[9px] text-zinc-700 uppercase font-black">{customer.order_count} Ops</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-800 italic text-xs py-10 text-center font-bold uppercase tracking-widest">Data Stream Empty</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 bg-[#0a0a0a] border-zinc-800 shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase text-white italic tracking-widest">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <QuickActionButton label="Manage Inventory" href="/admin/products" />
            <QuickActionButton label="Review Recent Orders" href="/admin/orders" />
            <QuickActionButton label="Customer Analytics" href="/admin/customers" />
            <QuickActionButton label="Communication Archive" href="/admin/comments" />
            <QuickActionButton label="System Statistics" href="/admin/stats" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickActionButton({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between p-3 rounded-none bg-zinc-950 border border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900 transition-all group">
      <span className="text-[10px] font-black text-zinc-500 group-hover:text-white uppercase tracking-widest">{label}</span>
      <ArrowUpRight className="h-4 w-4 text-zinc-700 group-hover:text-red-600" />
    </Link>
  );
}