"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2, Search, ChevronDown, ShoppingBag,
  ChevronLeft, ChevronRight, Hash, Calendar, Filter, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "sonner";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // THUẬT TOÁN LỌC THỜI GIAN
  const [dateFilter, setDateFilter] = useState({
    day: "all",
    month: "all",
    year: new Date().getFullYear().toString()
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 8; // Tăng lên 8 đơn/trang cho bề thế

  const statusOptions = ["Pending", "Paid", "Shipping", "Completed", "Cancelled"];
  const years = [2024, 2025, 2026];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (error) {
      toast.error("SYNC_ERROR", { description: "Link to terminal failed." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        toast.success("STATUS UPDATED", { description: `Order #${orderId} set to ${newStatus.toUpperCase()}` });
      }
    } catch (error) { toast.error("SYSTEM ERROR"); }
  };

  // LOGIC LỌC TỔNG HỢP: Search + Status + Day + Month + Year
  const filteredOrders = orders.filter((o) => {
    const orderDate = new Date(o.created_at);
    const matchesSearch = o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.toString().includes(searchQuery);
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const matchesYear = dateFilter.year === "all" || orderDate.getFullYear().toString() === dateFilter.year;
    const matchesMonth = dateFilter.month === "all" || (orderDate.getMonth() + 1).toString() === dateFilter.month;
    const matchesDay = dateFilter.day === "all" || orderDate.getDate().toString() === dateFilter.day;

    return matchesSearch && matchesStatus && matchesYear && matchesMonth && matchesDay;
  });

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterStatus, dateFilter]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // THUẬT TOÁN PHÂN TRANG TỐI ĐA 3 Ô SỐ
  const getPageNumbers = () => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage === 1) return [1, 2, 3];
    if (currentPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 1, currentPage, currentPage + 1];
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>
  );

  return (
    <div className="w-[95%] lg:w-[90%] mx-auto space-y-8 py-10 animate-in fade-in duration-700">
      <Toaster position="top-center" theme="light" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-border pb-8">
        <div className="space-y-1">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-foreground leading-none">Order Hub<span className="text-primary">.</span></h1>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em] italic pl-1">v.26 Registry Analysis</p>
        </div>
      </div>

      {/* MULTI-FILTER BAR */}
      <div className="bg-muted/20 border border-border p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH LOGS / NAME..."
            className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-none text-xs font-bold uppercase italic outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Lọc Năm */}
          <select value={dateFilter.year} onChange={(e) => setDateFilter({ ...dateFilter, year: e.target.value })} className="bg-background border border-border p-3 text-[10px] font-black uppercase italic outline-none focus:border-primary cursor-pointer">
            <option value="all">Any Year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {/* Lọc Tháng */}
          <select value={dateFilter.month} onChange={(e) => setDateFilter({ ...dateFilter, month: e.target.value })} className="bg-background border border-border p-3 text-[10px] font-black uppercase italic outline-none focus:border-primary cursor-pointer">
            <option value="all">Any Month</option>
            {months.map(m => <option key={m} value={m}>Month {m.toString().padStart(2, '0')}</option>)}
          </select>
          {/* Lọc Ngày */}
          <select value={dateFilter.day} onChange={(e) => setDateFilter({ ...dateFilter, day: e.target.value })} className="bg-background border border-border p-3 text-[10px] font-black uppercase italic outline-none focus:border-primary cursor-pointer">
            <option value="all">Any Day</option>
            {days.map(d => <option key={d} value={d}>Day {d.toString().padStart(2, '0')}</option>)}
          </select>
          {/* Lọc Status */}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-background border border-border p-3 text-[10px] font-black uppercase italic outline-none focus:border-primary cursor-pointer">
            <option value="all">All Status</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {/* Nút Clear */}
          <button onClick={() => { setSearchQuery(""); setFilterStatus("all"); setDateFilter({ day: "all", month: "all", year: "2026" }) }} className="bg-foreground text-background text-[10px] font-black uppercase italic hover:bg-primary hover:text-white transition-all cursor-pointer">Clear Filters</button>
        </div>
      </div>

      {/* TABLE */}
      <div className="border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-muted/30">
              <tr className="border-b border-border text-[10px] font-black uppercase text-muted-foreground italic tracking-widest">
                <th className="p-6">ID</th>
                <th className="p-6">Entity</th>
                <th className="p-6">Drop Specs</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-right">Registry Date</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-all group">
                  <td className="p-6 font-mono font-black text-primary italic text-sm">#ORD-{order.id}</td>
                  <td className="p-6">
                    <p className="text-sm font-black uppercase italic text-foreground leading-none">{order.customer_name || "Guest"}</p>
                    <p className="text-[10px] text-muted-foreground font-bold lowercase mt-2">{order.customer_email}</p>
                  </td>
                  <td className="p-6">
                    <div className="space-y-3">
                      {order.items && order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                          <Hash size={10} className="text-primary" />
                          <span className="text-[10px] font-black uppercase italic text-foreground">{item.name} <span className="ml-2 opacity-40">({item.size}) x{item.quantity}</span></span>
                        </div>
                      ))}
                      <p className="text-[11px] font-black text-primary mt-4 border-t border-border pt-2 w-fit">Total: ${parseFloat(order.total_amount).toFixed(2)}</p>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="relative inline-block w-40">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={cn(
                          "w-full appearance-none bg-background border border-border px-4 py-2 text-[10px] font-black uppercase italic cursor-pointer outline-none",
                          order.status === 'Completed' && "text-primary border-primary/30 bg-primary/5"
                        )}
                      >
                        {statusOptions.map(option => <option key={option} value={option}>{option.toUpperCase()}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                    </div>
                  </td>
                  <td className="p-6 text-right text-[10px] font-mono text-muted-foreground uppercase italic">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODERN PAGINATION - MAX 3 SLOTS */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase text-muted-foreground italic tracking-widest">
              Secured Logs: {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="h-10 w-10 border border-border flex items-center justify-center hover:bg-muted disabled:opacity-20 cursor-pointer bg-background"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Ellipsis Start */}
              {currentPage > 2 && <span className="text-muted-foreground px-2 text-[10px] font-black">...</span>}

              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "h-10 w-10 font-black italic text-xs border cursor-pointer transition-all",
                    currentPage === page ? "bg-primary border-primary text-primary-foreground shadow-lg" : "bg-background border-border text-muted-foreground hover:border-primary"
                  )}
                >
                  {page}
                </button>
              ))}

              {/* Ellipsis End */}
              {currentPage < totalPages - 1 && <span className="text-muted-foreground px-2 text-[10px] font-black">...</span>}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="h-10 w-10 border border-border flex items-center justify-center hover:bg-muted disabled:opacity-20 cursor-pointer bg-background"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}