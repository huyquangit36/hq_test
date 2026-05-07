"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Users, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AdvancedStatsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then(res => res.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8 text-white uppercase font-black animate-pulse text-center">Analysing Live Data...</div>;

  const avgOrder = data.revenue / (data.orders || 1);

  return (
    <div className="p-2 space-y-8 bg-black text-white min-h-screen font-sans">
      <div>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Statistics & Reports<span className="text-red-600">.</span></h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Real-time Growth Metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DonutStatCard 
          title="Total Revenue" 
          value={`$${data.revenue.toFixed(2)}`} 
          items={(data.categoryDist || []).map((c: any) => ({ label: c.category, val: parseFloat(c.revenue_share || 0) }))}
          total={data.revenue}
          icon={<DollarSign className="h-3 w-3"/>}
          change={data.revenueGrowth} // TĂNG TRƯỞNG THẬT
        />
        <DonutStatCard 
          title="Total Orders" 
          value={data.orders} 
          items={(data.categoryDist || []).map((c: any) => ({ label: c.category, val: parseInt(c.count || 0) }))}
          total={data.orders}
          icon={<ShoppingCart className="h-3 w-3"/>}
          change={data.ordersGrowth} // TĂNG TRƯỞNG THẬT
        />
        <DonutStatCard 
          title="Active Customers" 
          value={data.customers} 
          items={[{ label: 'Users', val: data.customers }]}
          total={data.customers}
          icon={<Users className="h-3 w-3"/>}
          change={data.customersGrowth} // TĂNG TRƯỞNG THẬT
        />
        <DonutStatCard 
          title="Avg. Order Value" 
          value={`$${avgOrder.toFixed(2)}`} 
          items={[{ label: 'Value', val: avgOrder }]}
          total={avgOrder}
          icon={<TrendingUp className="h-4 w-4"/>}
          change="Live"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#0a0a0a] border-zinc-800 text-white shadow-none">
          <CardHeader><CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Order Status Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <ProgressBar label="Pending" value={(data.statusDist || []).find((s:any)=>s.status==='Pending')?.count || 0} total={data.orders} color="bg-yellow-500" />
            <ProgressBar label="Shipping" value={(data.statusDist || []).find((s:any)=>s.status==='Shipping')?.count || 0} total={data.orders} color="bg-blue-500" />
            <ProgressBar label="Completed" value={(data.statusDist || []).find((s:any)=>s.status==='Completed')?.count || 0} total={data.orders} color="bg-green-500" />
          </CardContent>
        </Card>

<Card className="bg-[#0a0a0a] border-zinc-800 text-white shadow-none">
  <CardHeader>
    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">
      Sales Distribution by Category
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-6">
     {['tshirts', 'hoodies', 'pants', 'accessories'].map(cat => {
        // Tìm danh mục trong mảng data.categoryDist trả về từ API
        const item = (data.categoryDist || []).find((c: any) => c.category.toLowerCase() === cat);
        
        // Giá trị bán được (count) từ API, nếu không có thì mặc định là 0
        const soldCount = item ? parseInt(item.count) : 0;
        
        return (
          <ProgressBar 
            key={cat} 
            label={cat} 
            value={soldCount} 
            total={data.orders || 1} 
            color={cat === 'tshirts' ? "bg-white" : "bg-red-600"} 
          />
        );
     })}
  </CardContent>
</Card>
      </div>

      <Card className="bg-[#0a0a0a] border-zinc-800 text-white shadow-none">
        <CardHeader className="border-b border-zinc-900 mb-4">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Top Customers by Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-600 border-b border-zinc-900 uppercase text-[10px] font-black">
                <th className="text-left p-4">Rank</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-center p-4">Orders</th>
                <th className="text-right p-4">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {(data.topCustomers || []).map((c: any, index: number) => (
                <tr key={index} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-950 transition-colors">
                  <td className="p-4 font-black italic text-red-600">0{index + 1}</td>
                  <td className="p-4">
                    <div className="font-black uppercase italic text-white text-xs">{c.full_name}</div>
                    <div className="text-[10px] text-zinc-600 font-bold uppercase">{c.email}</div>
                  </td>
                  <td className="p-4 text-center font-mono text-zinc-400">{c.order_count}</td>
                  <td className="p-4 text-right font-black italic text-white">${parseFloat(c.total_spent).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function DonutStatCard({ title, value, items, icon, change }: any) {
  const [hoveredItem, setHoveredItem] = useState<any>(null);

  // BƯỚC QUAN TRỌNG: Lọc bỏ những danh mục có giá trị (val) = 0
  // Nếu chưa bán được Hoodie nào, val sẽ là 0 và nó bị loại bỏ khỏi biểu đồ
  const activeItems = (items || []).filter((item: any) => item.val > 0);

  // Tính lại tổng dựa trên các mục thực tế có tiền
  const actualTotal = activeItems.reduce((acc: number, curr: any) => acc + curr.val, 0);

  const categoryColors: { [key: string]: string } = {
    "tshirts": "#ffffff",
    "hoodies": "#dc2626",
    "pants": "#3f3f46",
    "accessories": "#71717a"
  };

  let currentOffset = 0;

  return (
    <Card className="bg-[#0a0a0a] border-zinc-800 text-white rounded-xl shadow-none p-6 transition-all hover:border-zinc-700">
      <div className="flex flex-col items-center gap-6">
        <div className="flex justify-between items-center w-full">
           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">{title}</p>
           <div className="text-red-600">{icon}</div>
        </div>

        <div className="relative h-32 w-32 group flex items-center justify-center">
          <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90 overflow-visible">
            <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#111111" strokeWidth="3" />
            
            {/* CHỈ VẼ KHI CÓ DỮ LIỆU THẬT SỰ BÁN ĐƯỢC */}
            {activeItems.length > 0 ? activeItems.map((item: any) => {
              const percentage = (item.val / actualTotal) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeOffset = -currentOffset;
              currentOffset += percentage;
              
              const isHovered = hoveredItem?.label === item.label;

              return (
                <circle 
                  key={item.label} cx="21" cy="21" r="15.9" fill="transparent" 
                  stroke={categoryColors[item.label.toLowerCase()] || "#444"} 
                  strokeWidth={isHovered ? "6" : "3"} 
                  strokeDasharray={strokeDasharray} 
                  strokeDashoffset={strokeOffset} 
                  className="transition-all duration-300 cursor-pointer"
                  style={{ pointerEvents: 'stroke' }}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                />
              );
            }) : (
              <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#1f1f1f" strokeWidth="1" strokeDasharray="2,2" />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-black italic tracking-tighter text-white">
                {hoveredItem ? (title.toLowerCase().includes('revenue') ? `$${hoveredItem.val}` : hoveredItem.val) : value}
            </span>
            <span className="text-[8px] font-black text-zinc-500 uppercase">
                {hoveredItem ? hoveredItem.label : (actualTotal > 0 ? change : "NO DATA")}
            </span>
          </div>
        </div>

        {/* CHÚ THÍCH CŨNG CHỈ HIỆN NHỮNG THẰNG ĐÃ BÁN ĐƯỢC */}
        <div className="flex flex-wrap justify-center gap-4">
             {activeItems.map((item: any) => (
                <div key={item.label} className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: categoryColors[item.label.toLowerCase()] || "#444" }}></div>
                  <span className="text-[8px] font-black uppercase italic">{item.label}</span>
                </div>
             ))}
        </div>
      </div>
    </Card>
  );
}

function ProgressBar({ label, value, total, color }: any) {
  const percentage = Math.min((value / (total || 1)) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase italic tracking-widest">
        <span className="text-zinc-400">{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-[2px] w-full bg-zinc-900 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}