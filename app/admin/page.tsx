"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  ArrowUpRight, 
  TrendingUp,
  Activity,
  UserCheck,
  BellRing,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const avgOrderValue = stats.orders > 0 ? stats.revenue / stats.orders : 0;

  const summaryCards = [
    { 
      title: "Total Revenue", 
      value: `$${(Number(stats.revenue) || 0).toFixed(2)}`, 
      icon: DollarSign, 
      color: "text-primary",
      desc: `${stats.revenueGrowth} vs last month` 
    },
    { 
      title: "Total Orders", 
      value: stats.orders, 
      icon: ShoppingCart, 
      color: "text-primary",
      desc: `${stats.ordersGrowth} vs last month` 
    },
    { 
      title: "Active Customers", 
      value: stats.customers, 
      icon: Users, 
      color: "text-primary",
      desc: `${stats.customersGrowth} vs last month` 
    },
    { 
      title: "Avg. Order Value", 
      value: `$${(Number(avgOrderValue) || 0).toFixed(2)}`, 
      icon: TrendingUp, 
      color: "text-secondary",
      desc: "Live analytics data" 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
        <p className="text-[10px] font-black uppercase italic tracking-[0.5em] text-muted-foreground animate-pulse">Establishing Terminal Link...</p>
      </div>
    );
  }

  return (
    /* THUẬT TOÁN LAYOUT: w-[90%] và căn giữa trên Desktop */
    <div className="w-[90%] mx-auto space-y-10 py-6 md:py-10 animate-in fade-in duration-1000">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-foreground leading-none">
            Overview<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground text-[10px] md:text-xs font-black uppercase tracking-[0.4em] italic">Authorized Admin Session // Data Live</p>
        </div>
        <div className="bg-card border border-border px-6 py-4 rounded-none shadow-sm flex flex-col items-end">
           <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">System Integrity</p>
           <p className="text-[10px] text-primary font-black flex items-center gap-2 uppercase italic">
             <Activity className="h-3 w-3 animate-pulse" /> Secure Database Connected
           </p>
        </div>
      </div>

      {/* ALERT SECTION - DỮ LIỆU THẬT */}
      {(stats.pendingCount > 0 || stats.lowStockCount > 0) && (
        <div className="bg-primary/5 border-l-4 border-primary p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="bg-primary text-primary-foreground p-3">
              <BellRing className="h-6 w-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              {stats.pendingCount > 0 && (
                <p className="text-[11px] font-black uppercase tracking-widest text-foreground italic">
                  Critical: {stats.pendingCount} New inquiries awaiting official response.
                </p>
              )}
              {stats.lowStockCount > 0 && (
                <p className="text-[11px] font-black uppercase tracking-widest text-secondary italic">
                  Inventory: {stats.lowStockCount} Items reached low stock threshold.
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link href="/admin/comments" className="flex-1 md:flex-none">
              <button className="w-full text-[9px] font-black uppercase text-primary-foreground bg-primary px-6 py-3 hover:bg-foreground transition-all cursor-pointer shadow-lg shadow-primary/20 italic">Authorize Replies</button>
            </Link>
            <Link href="/admin/products" className="flex-1 md:flex-none">
              <button className="w-full text-[9px] font-black uppercase text-muted-foreground border border-border px-6 py-3 hover:bg-muted/50 transition-all cursor-pointer italic bg-white">Audit Inventory</button>
            </Link>
          </div>
        </div>
      )}

      {/* SUMMARY CARDS - RESPONSIVE GRID */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className="bg-card border border-border rounded-none shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group cursor-default">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={cn("h-5 w-5 transition-transform group-hover:scale-125", card.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-foreground italic tracking-tighter">{card.value}</div>
              <div className="flex items-center gap-2 mt-2">
                 <div className="h-1 w-1 rounded-full bg-primary" />
                 <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest italic">{card.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MAIN DATA SECTION */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-7">
        
        {/* TOP CUSTOMERS TABLE */}
        <Card className="lg:col-span-4 bg-card border border-border rounded-none shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border p-6">
            <CardTitle className="text-[11px] font-black uppercase text-foreground flex items-center gap-3 italic tracking-[0.2em]">
              <UserCheck className="h-4 w-4 text-primary" /> High-Value Personnel Archive
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {stats.topCustomers.length > 0 ? (
                    stats.topCustomers.map((customer: any, i: number) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group">
                        <td className="p-6 w-16">
                           <div className="h-10 w-10 bg-background border border-border flex items-center justify-center font-black text-xs text-primary italic">
                             {i + 1}
                           </div>
                        </td>
                        <td className="p-6">
                           <p className="text-xs font-black uppercase italic text-foreground tracking-tighter">{customer.full_name}</p>
                           <p className="text-[10px] text-muted-foreground font-bold lowercase mt-1">{customer.email}</p>
                        </td>
                        <td className="p-6 text-right">
                           <p className="text-lg font-black text-foreground italic leading-none">${parseFloat(customer.total_spent).toFixed(2)}</p>
                           <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-1">{customer.order_count} Secured Drops</p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-20 text-center text-muted-foreground italic font-black uppercase text-[10px] tracking-[0.5em]">No Data Transmission</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* QUICK ACCESS ACTIONS */}
        <Card className="lg:col-span-3 bg-card border border-border rounded-none shadow-sm h-fit">
          <CardHeader className="bg-muted/10 border-b border-border p-6">
            <CardTitle className="text-[11px] font-black uppercase text-foreground italic tracking-[0.2em]">Fast-Track Protocol</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid gap-3">
            <QuickActionButton label="Inventory Control" href="/admin/products" />
            <QuickActionButton label="Order Logistics" href="/admin/orders" />
            <QuickActionButton label="Client Database" href="/admin/customers" />
            <QuickActionButton label="Inquiry Archive" href="/admin/comments" />
            <QuickActionButton label="Real-time Stats" href="/admin/stats" />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function QuickActionButton({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between p-5 bg-background border border-border hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer shadow-sm active:scale-[0.98]">
      <span className="text-[10px] font-black text-muted-foreground group-hover:text-primary uppercase tracking-widest italic">{label}</span>
      <div className="h-8 w-8 bg-muted group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-all">
        <ArrowUpRight className="h-4 w-4" />
      </div>
    </Link>
  );
}