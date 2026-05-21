"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart, Users, DollarSign, TrendingUp, Activity, PieChart,
  Calendar, Briefcase, ArrowUpRight, ArrowDownRight, AlertTriangle, Download, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { toast } from "sonner"; // Chỉ import toast, xóa Toaster để tránh lỗi render

export default function AdvancedStatsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [filters, setFilter] = useState({
    month: currentMonth,
    year: currentYear,
    category: "all"
  });

  const years = [currentYear - 2, currentYear - 1, currentYear];
  const availableMonths = filters.year === currentYear
    ? Array.from({ length: currentMonth }, (_, i) => i + 1)
    : Array.from({ length: 12 }, (_, i) => i + 1);

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      month: filters.month.toString(),
      year: filters.year.toString(),
      category: filters.category
    });
    try {
      const res = await fetch(`/api/admin/stats?${params}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Fetch Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // --- THUẬT TOÁN XUẤT EXCEL CHI TIẾT SẢN PHẨM ---
  const handleExportExcel = () => {
    if (!data || !data.detailedItems) {
      toast.error("NO DATA FOUND");
      return;
    }
    const wb = XLSX.utils.book_new();

    // 1. Sheet Tổng quan
    const wsSummary = XLSX.utils.json_to_sheet([
      { "CRITERIA": "REPORT_MONTH", "DATA": `${filters.month}/${filters.year}` },
      { "CRITERIA": "GROSS_REVENUE", "DATA": `$${data.revenue.toLocaleString()}` },
      { "CRITERIA": "SUCCESSFUL_DROPS", "DATA": data.orders },
      { "CRITERIA": "CANCEL_RATE", "DATA": `${data.cancelRate}%` }
    ]);
    XLSX.utils.book_append_sheet(wb, wsSummary, "OVERVIEW_STATS");

    // 2. Sheet CHI TIẾT SẢN PHẨM (Bác cần cái này nhất)
    const salesLog = data.detailedItems.map((item: any) => ({
      "ORDER_ID": `#ORD-${item.order_id}`,
      "DATE": new Date(item.created_at).toLocaleDateString(),
      "PRODUCT": item.product_name.toUpperCase(),
      "SIZE": item.size,
      "QTY": item.quantity,
      "UNIT_PRICE": `$${item.unit_price}`,
      "SUBTOTAL": `$${item.subtotal}`
    }));
    const wsSales = XLSX.utils.json_to_sheet(salesLog);
    XLSX.utils.book_append_sheet(wb, wsSales, "DETAILED_SALES_LOG");

    // Xuất file
    XLSX.writeFile(wb, `HQ_FULL_ARCHIVE_M${filters.month}.xlsx`);
    toast.success("EXCEL EXPORTED", { description: "Detailed log dispatched to downloads." });
  };

  if (loading && !data) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-primary">
      <Activity className="animate-spin h-10 w-10" />
    </div>
  );

  const avgValue = data?.revenue / (data?.orders || 1);

  return (
    <div className="w-[95%] lg:w-[90%] mx-auto space-y-8 py-10 animate-in fade-in duration-700">
      {/* KHÔNG ĐỂ THẺ <Toaster /> Ở ĐÂY NỮA, HÃY ĐỂ Ở APP/LAYOUT.TSX */}

      {/* FILTER HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b-2 border-border pb-8 text-foreground">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
            Analytics<span className="text-primary">.</span>
          </h1>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em] italic mt-2">Active Protocol: {filters.month}/{filters.year}</p>
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
          {/* NÚT EXCEL */}
          <button
            onClick={handleExportExcel}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3 text-[10px] font-black uppercase italic hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <Download size={14} /> Export Detailed logs
          </button>

          <div className="flex flex-wrap gap-2 bg-muted/20 p-2 border border-border flex-1 lg:flex-none">
            <div className="flex items-center gap-2 px-3 border-r border-border bg-background flex-1 lg:flex-none">
              <Calendar size={14} className="text-primary" />
              <select
                value={filters.month}
                onChange={(e) => setFilter({ ...filters, month: parseInt(e.target.value) })}
                className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer py-2 w-full"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>Month {m.toString().padStart(2, '0')}</option>
                ))}
              </select>
            </div>
            <select
              value={filters.year}
              onChange={(e) => setFilter({ ...filters, year: parseInt(e.target.value) })}
              className="bg-background border-border text-[10px] font-black uppercase outline-none cursor-pointer px-4 flex-1 lg:flex-none"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard title="Revenue" value={`$${(data?.revenue || 0).toLocaleString()}`} change={data?.revenueGrowth} icon={DollarSign} up={true} />
        <SummaryCard title="Avg. Order" value={`$${avgValue.toFixed(0)}`} change="Live" icon={Briefcase} up={true} />
        <SummaryCard title="Total Drops" value={data?.orders} change={data?.ordersGrowth} icon={ShoppingCart} up={true} />
        <SummaryCard title="Growth Rate" value={data?.revenueGrowth} change="Monthly" icon={TrendingUp} up={true} />
        <SummaryCard title="Cancellation" value={`${data?.cancelRate}%`} change="System Risk" icon={AlertTriangle} up={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* EFFICIENCY TIMELINE */}
        <Card className="lg:col-span-7 bg-card border-border rounded-none shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border p-6">
            <CardTitle className="text-[11px] font-black uppercase italic text-foreground tracking-widest">Efficiency Timeline</CardTitle>
          </CardHeader>
          <CardContent className="p-12 h-[350px] flex items-end justify-start gap-4 overflow-x-auto scrollbar-hide">
            {data?.dailyStats?.length > 0 ? data.dailyStats.map((stat: any, i: number) => {
              const maxItems = Math.max(...data.dailyStats.map((d: any) => d.count)) || 1;
              const h = (stat.count / maxItems) * 100;
              return (
                <div key={i} className="flex-none w-[calc((100%-112px)/8)] min-w-[70px] flex flex-col items-center gap-4 group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute -top-12 bg-foreground text-background text-[8px] font-black px-3 py-2 shadow-xl z-20 whitespace-nowrap border-l-2 border-primary">
                    <p>{stat.count} ITEMS SECURED</p>
                    <p className="text-primary mt-0.5">VALUE: ${stat.revenue.toFixed(0)}</p>
                  </div>
                  <div className="relative w-full h-48 flex items-end justify-center">
                    <div className="w-3 bg-primary shadow-lg shadow-primary/20 transition-all duration-500 group-hover:bg-foreground group-hover:w-4" style={{ height: `${Math.max(h, 5)}%` }} />
                  </div>
                  <p className="text-[10px] font-black text-foreground whitespace-nowrap italic">{stat.day.toString().padStart(2, '0')}/{filters.month.toString().padStart(2, '0')}</p>
                </div>
              )
            }) : (
              <div className="w-full h-full flex items-center justify-center italic text-muted-foreground text-[10px] uppercase font-black">No transmission logs found</div>
            )}
          </CardContent>
        </Card>

        {/* DONUT CHART */}
        <div className="lg:col-span-5">
          <DonutStatCard
            title="Sector Performance"
            value={`$${(data?.revenue || 0).toLocaleString()}`}
            items={(data?.categoryDist || []).map((c: any) => ({ label: c.category, val: parseFloat(c.revenue_share || 0) }))}
          />
        </div>
      </div>
    </div>
  );
}

// Các sub-components bác giữ nguyên nhưng xóa Toaster nếu có
function SummaryCard({ title, value, change, icon: Icon, up }: any) {
  return (
    <Card className="bg-card border-border rounded-none p-6 shadow-sm hover:border-primary/40 transition-all group">
      <div className="flex justify-between mb-4">
        <div className="p-2 bg-muted/50 border border-border group-hover:bg-primary/10 transition-colors"><Icon size={14} className="text-primary" /></div>
      </div>
      <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest leading-none">{title}</p>
      <h3 className="text-2xl font-black italic text-foreground mt-2 tracking-tighter">{value}</h3>
      <div className={cn("flex items-center gap-1 mt-2 text-[10px] font-black uppercase", up ? "text-green-600" : "text-red-600")}>
        {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {change}
      </div>
    </Card>
  )
}

function DonutStatCard({ title, value, items }: any) {
  const activeItems = (items || []).filter((item: any) => item.val > 0);
  const total = activeItems.reduce((acc: number, curr: any) => acc + curr.val, 0);
  const colors = ["#65a3aa", "#457b83", "#2c4e54", "#1a2f35"];
  let currentOffset = 0;

  return (
    <Card className="bg-card border-border rounded-none p-8 h-full">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-10 italic text-foreground">Distribution Analysis</p>
      <div className="flex flex-col items-center gap-10">
        <div className="relative h-48 w-48 flex items-center justify-center">
          <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90 overflow-visible">
            {activeItems.map((item: any, idx: number) => {
              const p = (item.val / (total || 1)) * 100;
              const dash = `${p} ${100 - p}`;
              const offset = -currentOffset;
              currentOffset += p;
              return <circle key={idx} cx="21" cy="21" r="15.9" fill="transparent" stroke={colors[idx % colors.length]} strokeWidth="4" strokeDasharray={dash} strokeDashoffset={offset} className="transition-all duration-500" />
            })}
          </svg>
          <div className="absolute text-center leading-none">
            <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Gross</p>
            <p className="text-xl font-black italic tracking-tighter text-foreground">{value}</p>
          </div>
        </div>
        <div className="w-full space-y-3">
          {activeItems.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center text-[10px] font-black uppercase italic group cursor-default">
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} /><span className="text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span></div>
              <span className="text-foreground">{Math.round((item.val / (total || 1)) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}