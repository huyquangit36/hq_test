"use client";
import { useEffect, useState } from "react";
import { ShoppingCart, Users, DollarSign, TrendingUp, Activity, PieChart, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AdvancedStatsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then(res => res.json()).then(setData);
  }, []);

  if (!data) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <Activity className="animate-spin text-primary h-12 w-12" />
      <p className="text-[10px] font-black uppercase italic tracking-[0.5em] text-muted-foreground animate-pulse">Analysing Live Data Stream...</p>
    </div>
  );

  const avgOrder = data.revenue / (data.orders || 1);

  return (
    <div className="w-[95%] lg:w-[90%] mx-auto space-y-10 py-10 animate-in fade-in duration-1000">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-border pb-10">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-foreground leading-none">
            Analytics<span className="text-primary">.</span>
          </h1>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em] italic pl-1">Performance Metrics // Real-time Report</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
           <span className="text-[10px] font-black uppercase italic text-foreground tracking-widest">Live Sync Active</span>
        </div>
      </div>

      {/* SUMMARY CARDS (Donut Charts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DonutStatCard 
          title="Total Revenue" 
          value={`$${Number(data.revenue).toFixed(2)}`} 
          items={(data.categoryDist || []).map((c: any) => ({ label: c.category, val: parseFloat(c.revenue_share || 0) }))}
          total={data.revenue}
          icon={<DollarSign className="h-4 w-4"/>}
          change={data.revenueGrowth} 
        />
        <DonutStatCard 
          title="Drop Volume" 
          value={data.orders} 
          items={(data.categoryDist || []).map((c: any) => ({ label: c.category, val: parseInt(c.count || 0) }))}
          total={data.orders}
          icon={<ShoppingCart className="h-4 w-4"/>}
          change="Completed" 
        />
        <DonutStatCard 
          title="Active Members" 
          value={data.customers} 
          items={[{ label: 'Verified', val: data.customers }]}
          total={data.customers}
          icon={<Users className="h-4 w-4"/>}
          change="Total Base"
        />
        <DonutStatCard 
          title="Average Value" 
          value={`$${avgOrder.toFixed(2)}`} 
          items={[{ label: 'Mean', val: avgOrder }]}
          total={avgOrder}
          icon={<TrendingUp className="h-4 w-4"/>}
          change="System Live"
        />
      </div>

      {/* PROGRESS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Status Distribution */}
        <Card className="bg-card border-border rounded-none shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border p-6">
            <CardTitle className="text-[11px] font-black uppercase text-foreground italic tracking-[0.2em] flex items-center gap-3">
              <Activity size={14} className="text-primary" /> Order Pipeline Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <ProgressBar label="Pending Authorization" value={(data.statusDist || []).find((s:any)=>s.status==='Pending')?.count || 0} total={data.totalOrdersAll} color="bg-secondary" />
            <ProgressBar label="In Transit" value={(data.statusDist || []).find((s:any)=>s.status==='Shipping')?.count || 0} total={data.totalOrdersAll} color="bg-primary/60" />
            <ProgressBar label="Completed Secures" value={(data.statusDist || []).find((s:any)=>s.status==='Completed')?.count || 0} total={data.totalOrdersAll} color="bg-primary" />
          </CardContent>
        </Card>

        {/* Category Sales Distribution */}
        <Card className="bg-card border-border rounded-none shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border p-6">
            <CardTitle className="text-[11px] font-black uppercase text-foreground italic tracking-[0.2em] flex items-center gap-3">
              <PieChart size={14} className="text-primary" /> Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
             {(data.categoryDist || []).length > 0 ? data.categoryDist.map((item: any) => (
                <ProgressBar 
                    key={item.category} 
                    label={item.category} 
                    value={item.count} 
                    total={data.orders} 
                    color={item.category.toLowerCase().includes('tshirt') ? "bg-foreground" : "bg-primary"} 
                />
             )) : (
                <div className="py-12 text-center text-[10px] font-black uppercase text-muted-foreground italic tracking-widest border border-dashed border-border bg-muted/5">
                  No Transmission Logged
                </div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* TOP CUSTOMERS TABLE */}
      <Card className="bg-card border-border rounded-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border p-6">
          <CardTitle className="text-[11px] font-black uppercase text-foreground italic tracking-[0.2em]">High-Priority Acquisition Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/20 border-b border-border text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">
                  <th className="p-6">Rank</th>
                  <th className="p-6">Entity</th>
                  <th className="p-6 text-center">Volume</th>
                  <th className="p-6 text-right">Gross Value</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((c: any, index: number) => (
                  <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/30 transition-all cursor-pointer group">
                    <td className="p-6 w-16 italic font-black text-primary">0{index + 1}</td>
                    <td className="p-6">
                      <p className="font-black uppercase italic text-foreground text-sm tracking-tighter group-hover:text-primary transition-colors">{c.full_name}</p>
                      <p className="text-[9px] text-muted-foreground font-bold lowercase mt-1">{c.email}</p>
                    </td>
                    <td className="p-6 text-center font-mono font-bold text-xs text-foreground/70">{c.order_count} Secured Ops</td>
                    <td className="p-6 text-right font-black italic text-foreground text-lg tracking-tighter">${parseFloat(c.total_spent).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DonutStatCard({ title, value, items, icon, change }: any) {
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const activeItems = (items || []).map((i: any) => ({ ...i, val: Number(i.val) })).filter((item: any) => item.val > 0);
  const actualTotal = activeItems.reduce((acc: number, curr: any) => acc + curr.val, 0);

  const getCategoryColor = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('tshirt')) return "var(--foreground)"; // Navy/Black
    return "var(--primary)"; // Jade/Mint
  };

  let currentOffset = 0;

  return (
    <Card className="bg-card border border-border rounded-none shadow-sm p-8 transition-all hover:border-primary/40 group">
      <div className="flex flex-col items-center gap-8">
        <div className="flex justify-between items-center w-full">
           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">{title}</p>
           <div className="text-primary transition-transform group-hover:scale-110">{icon}</div>
        </div>

        <div className="relative h-40 w-40 flex items-center justify-center">
          <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90 overflow-visible">
            <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="var(--muted)" strokeWidth="3" />
            {activeItems.length > 0 ? activeItems.map((item: any) => {
              const percentage = (item.val / actualTotal) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeOffset = -currentOffset;
              currentOffset += percentage;
              return (
                <circle 
                  key={item.label} cx="21" cy="21" r="15.9" fill="transparent" 
                  stroke={getCategoryColor(item.label)} 
                  strokeWidth={hoveredItem?.label === item.label ? "5" : "3"} 
                  strokeDasharray={strokeDasharray} 
                  strokeDashoffset={strokeOffset} 
                  className="transition-all duration-500 cursor-pointer"
                  style={{ pointerEvents: 'stroke' }} 
                  onMouseEnter={() => setHoveredItem({ ...item, percent: Math.round(percentage) })}
                  onMouseLeave={() => setHoveredItem(null)}
                />
              );
            }) : (
              <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="var(--muted)" strokeWidth="1" strokeDasharray="2,2" />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl font-black italic tracking-tighter text-foreground">
                {hoveredItem ? (title.toLowerCase().includes('revenue') ? `$${hoveredItem.val.toFixed(0)}` : hoveredItem.val) : value}
            </span>
            <span className="text-[10px] font-black text-primary uppercase italic tracking-widest mt-1">
                {hoveredItem ? `${hoveredItem.percent}%` : change}
            </span>
            {hoveredItem && <span className="text-[7px] text-muted-foreground uppercase font-black mt-1">{hoveredItem.label}</span>}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 border-t border-border/50 pt-4 w-full">
             {activeItems.map((item: any) => (
                <div key={item.label} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(item.label) }}></div>
                  <span className="text-[8px] font-black uppercase italic tracking-tighter">{item.label}</span>
                </div>
             ))}
        </div>
      </div>
    </Card>
  );
}

function ProgressBar({ label, value, total, color }: any) {
  const val = Number(value) || 0;
  const tot = Number(total) || 1;
  const percentage = Math.round((val / tot) * 100);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] font-black uppercase italic tracking-widest">
        <span className="text-muted-foreground">{label} <span className="ml-2 text-primary opacity-50">({percentage}%)</span></span>
        <span className="text-foreground">{val} Units</span>
      </div>
      <div className="h-[3px] w-full bg-muted overflow-hidden">
        <div className={cn("h-full transition-all duration-1000 ease-out", color)} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}