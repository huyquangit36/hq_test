"use client";
import { useEffect, useState } from "react";
import { ShoppingCart, Users, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdvancedStatsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then(res => res.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8 text-white">Đang tải báo cáo...</div>;

  const avgOrder = data.revenue / (data.orders || 1);

  return (
    <div className="p-8 space-y-8 bg-black text-white min-h-screen">
      <div>
        <h1 className="text-3xl font-bold">Statistics & Reports</h1>
        <p className="text-muted-foreground text-sm">View your store performance and analytics</p>
      </div>

      {/* 4 Thẻ Summary phía trên */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`$${data.revenue.toFixed(2)}`} icon={<DollarSign className="h-4 w-4"/>} change="+12.5%" />
        <StatCard title="Total Orders" value={data.orders} icon={<ShoppingCart className="h-4 w-4"/>} change="+8.2%" />
        <StatCard title="Active Customers" value={data.customers} icon={<Users className="h-4 w-4"/>} change="+4.1%" />
        <StatCard title="Avg. Order Value" value={`$${avgOrder.toFixed(2)}`} icon={<TrendingUp className="h-4 w-4"/>} change="-2.3%" isLoss />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái: Trạng thái đơn hàng */}
        <Card className="bg-[#0a0a0a] border-zinc-800 text-white">
          <CardHeader><CardTitle className="text-sm font-bold uppercase">Order Status Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <ProgressBar label="Pending" value={data.statusDist.find((s:any)=>s.status==='Pending')?.count || 0} total={data.orders} color="bg-yellow-500" />
            <ProgressBar label="Shipping" value={data.statusDist.find((s:any)=>s.status==='Shipping')?.count || 0} total={data.orders} color="bg-blue-500" />
            <ProgressBar label="Completed" value={data.statusDist.find((s:any)=>s.status==='Completed')?.count || 0} total={data.orders} color="bg-green-500" />
          </CardContent>
        </Card>

        {/* Cột phải: Sản phẩm theo danh mục */}
        <Card className="bg-[#0a0a0a] border-zinc-800 text-white">
          <CardHeader><CardTitle className="text-sm font-bold uppercase">Products by Category</CardTitle></CardHeader>
          <CardContent className="space-y-6">
             {['tshirts', 'hoodies', 'pants', 'accessories'].map(cat => (
                <ProgressBar key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)} 
                  value={data.categoryDist.find((c:any)=>c.category===cat)?.count || 0} 
                  total={data.totalProducts || 10} color="bg-orange-500" />
             ))}
          </CardContent>
        </Card>
      </div>

      {/* Bảng Top Customers */}
      <Card className="bg-[#0a0a0a] border-zinc-800 text-white">
        <CardHeader><CardTitle className="text-sm font-bold uppercase">Top Customers by Spending</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800">
                <th className="text-left p-4">Rank</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-center p-4">Orders</th>
                <th className="text-right p-4">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {data.topCustomers.map((c: any, index: number) => (
                <tr key={index} className="border-b border-zinc-900 last:border-0">
                  <td className="p-4"><span className="bg-zinc-800 w-6 h-6 flex items-center justify-center rounded-full text-xs">{index + 1}</span></td>
                  <td className="p-4">
                    <div className="font-bold">{c.full_name}</div>
                    <div className="text-xs text-zinc-500">{c.email}</div>
                  </td>
                  <td className="p-4 text-center">{c.order_count}</td>
                  <td className="p-4 text-right font-bold text-green-400">${parseFloat(c.total_spent).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// Component con cho các thẻ nhỏ
function StatCard({ title, value, icon, change, isLoss }: any) {
  return (
    <Card className="bg-[#0a0a0a] border-zinc-800 text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium text-zinc-400">{title}</CardTitle>
        <div className="text-zinc-500">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-[10px] mt-1 ${isLoss ? 'text-red-500' : 'text-green-500'}`}>
          {isLoss ? '↘' : '↗'} {change} <span className="text-zinc-500">from last month</span>
        </p>
      </CardContent>
    </Card>
  );
}

// Component con cho thanh Progress Bar
function ProgressBar({ label, value, total, color }: any) {
  const percentage = Math.min((value / (total || 1)) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-300">{label}</span>
        <span className="font-bold">{value}</span>
      </div>
      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}