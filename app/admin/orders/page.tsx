"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, ChevronDown, ShoppingBag, ChevronLeft, ChevronRight, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const statusOptions = ["Pending", "Paid", "Shipping", "Completed", "Cancelled"];

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (error) {
      toast.error("DATA SYNC ERROR", { description: "Failed to connect to HQ Servers." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        toast.success("LOG UPDATED", {
          description: `Order #ORD-${orderId} status shifted to ${newStatus.toUpperCase()}.`,
          style: { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--primary)' }
        });
      }
    } catch (error) {
      toast.error("SYSTEM ERROR");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.id.toString().includes(searchQuery);
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="animate-spin text-primary h-12 w-12" />
      <p className="text-[10px] font-black uppercase italic tracking-[0.5em] text-muted-foreground animate-pulse">Syncing Order Data...</p>
    </div>
  );

  return (
    <div className="w-[95%] lg:w-[90%] mx-auto space-y-10 py-10 animate-in fade-in duration-1000">

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-border pb-10">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-foreground leading-none">Order Hub<span className="text-primary">.</span></h1>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em] italic pl-1">Transmission Logs // v.26 Monitoring</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/20 p-4 border border-border">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="SEARCH REGISTRY ID OR CUSTOMER NAME..." 
            className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-none text-xs font-bold uppercase italic outline-none focus:border-primary transition-all" 
          />
        </div>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)} 
          className="bg-background border border-border text-[10px] font-black uppercase italic px-6 py-4 outline-none focus:border-primary cursor-pointer text-muted-foreground"
        >
          <option value="all">ALL SYSTEM STATUS</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>
      </div>

      {/* DATA TABLE */}
      <div className="border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-border bg-muted/10 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] italic">
                <th className="p-6">Registry ID</th>
                <th className="p-6">Entity Contact</th>
                <th className="p-6">Drop Specification</th>
                <th className="p-6 text-center">Protocol Status</th>
                <th className="p-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="animate-in fade-in duration-500">
              {currentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-all group">
                  <td className="p-6 font-mono font-black text-primary italic text-sm">#ORD-{order.id}</td>
                  <td className="p-6">
                    <p className="text-sm font-black uppercase italic text-foreground tracking-tighter">{order.customer_name || "Anonymous"}</p>
                    <p className="text-[10px] text-muted-foreground font-bold lowercase mt-1">{order.customer_email}</p>
                  </td>
                  
                  <td className="p-6">
                    <div className="space-y-3">
                       {order.items && order.items.map((item: any, idx: number) => (
                         <div key={idx} className="flex items-center gap-3">
                            <Hash size={10} className="text-primary" />
                            <span className="text-[11px] font-black uppercase italic text-foreground leading-none">
                              {item.name} 
                              <span className="ml-3 bg-foreground text-background px-2 py-0.5 text-[8px] not-italic">
                                {item.size || 'STD'}
                              </span>
                              <span className="ml-3 text-muted-foreground">× {item.quantity}</span>
                            </span>
                         </div>
                       ))}
                       <p className="text-[12px] font-black italic text-primary mt-4 border-t border-border/50 pt-2 w-fit">
                          VALUATION: ${parseFloat(order.total_amount).toFixed(2)}
                       </p>
                    </div>
                  </td>

                  <td className="p-6 text-center">
                    <div className="relative inline-block w-40">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={cn(
                          "w-full appearance-none bg-background border border-border px-4 py-2 text-[10px] font-black uppercase italic cursor-pointer outline-none transition-all",
                          order.status === 'Completed' && "text-primary border-primary/30 bg-primary/5",
                          order.status === 'Pending' && "text-orange-500 border-orange-500/30",
                          order.status === 'Cancelled' && "text-destructive border-destructive/30"
                        )}
                      >
                        {statusOptions.map(option => (
                          <option key={option} value={option}>{option.toUpperCase()}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                    </div>
                  </td>

                  <td className="p-6 text-right text-[10px] font-mono text-muted-foreground uppercase italic font-bold">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROL */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase text-muted-foreground italic tracking-widest">
              Logs {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} secured
            </p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="h-10 w-10 border border-border flex items-center justify-center hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer bg-background"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "h-10 w-10 font-black italic text-xs transition-all border cursor-pointer",
                    currentPage === page 
                      ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "bg-background border-border text-muted-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  {page}
                </button>
              ))}

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="h-10 w-10 border border-border flex items-center justify-center hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer bg-background"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 && (
          <div className="p-24 text-center">
             <p className="text-muted-foreground uppercase italic font-black text-xs tracking-[0.5em]">No synchronization found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}