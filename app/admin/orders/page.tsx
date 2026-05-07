"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, ChevronDown, CheckCircle2, ShoppingBag } from "lucide-react";
import { toast, Toaster } from "sonner"; // Sử dụng Sonner cho thông báo chuyên nghiệp

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const statusOptions = ["Pending", "Paid", "Shipping", "Completed", "Cancelled"];

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (error) {
      toast.error("DATA SYNC ERROR", {
        description: "Failed to fetch order logs from database.",
        style: { background: '#000', color: '#fff', border: '1px solid #dc2626' }
      });
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
        
        // THÔNG BÁO DẠNG BẢNG WEB
        toast.success("STATUS UPDATED", {
          description: `Order #ORD-${orderId} is now ${newStatus.toUpperCase()}.`,
          style: { background: '#000', color: '#fff', border: '1px solid #10b981' }
        });
      }
    } catch (error) {
      toast.error("UPDATE FAILED", {
        description: "Critical system error during status transition.",
        style: { background: '#000', color: '#fff', border: '1px solid #dc2626' }
      });
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.id.toString().includes(searchQuery);
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600 h-10 w-10" />
    </div>
  );

  return (
    <div className="p-2 space-y-6 bg-black min-h-screen text-white font-sans">
      {/* COMPONENT THÔNG BÁO */}
      <Toaster position="top-center" theme="dark" closeButton />

      <h1 className="text-4xl font-black uppercase italic tracking-tighter">Order Hub.</h1>

      <div className="flex flex-wrap gap-4 bg-zinc-950 p-4 border border-zinc-900">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="SEARCH LOGS / CUSTOMER..." 
            className="w-full pl-10 pr-4 py-2 bg-black border border-zinc-800 text-[10px] font-black uppercase italic outline-none focus:border-red-600 tracking-widest" 
          />
        </div>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)} 
          className="bg-black border border-zinc-800 text-[10px] font-black uppercase italic px-4 py-2 outline-none focus:border-red-600 text-zinc-500"
        >
          <option value="all">ALL STATUS</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>
      </div>

      <Card className="bg-[#0a0a0a] border-zinc-900 rounded-none shadow-none">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em]">
                <th className="p-6">Registry ID</th>
                <th className="p-6">Customer / Contact</th>
                <th className="p-6">Order Details (Items/Size)</th>
                <th className="p-6 text-center">System Status</th>
                <th className="p-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-zinc-900 hover:bg-zinc-950 transition-all duration-300">
                  <td className="p-6 font-mono font-black text-red-600 italic">#ORD-{order.id}</td>
                  <td className="p-6">
                    <p className="text-xs font-black uppercase italic text-white tracking-tighter">{order.customer_name || "Guest"}</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{order.customer_email}</p>
                  </td>
                  
                  {/* HIỂN THỊ CHI TIẾT SẢN PHẨM & SIZE */}
                  <td className="p-6">
                    <div className="space-y-2">
                       {order.items && order.items.map((item: any, idx: number) => (
                         <div key={idx} className="flex items-center gap-2 group">
                            <ShoppingBag size={10} className="text-zinc-700 group-hover:text-red-600 transition-colors" />
                            <span className="text-[10px] font-black uppercase italic text-zinc-400">
                              {item.name} 
                              <span className="ml-2 bg-zinc-900 text-white px-1.5 py-0.5 rounded-sm border border-zinc-800">
                                SIZE {item.size || 'N/A'}
                              </span>
                              <span className="ml-2 text-zinc-600">x{item.quantity}</span>
                            </span>
                         </div>
                       ))}
                       <p className="text-[11px] font-black italic text-white mt-2 tracking-tighter">
                          TOTAL: ${parseFloat(order.total_amount).toFixed(2)}
                       </p>
                    </div>
                  </td>

                  <td className="p-6 text-center">
                    <div className="relative inline-block w-36">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`w-full appearance-none bg-black border border-zinc-900 px-4 py-2 text-[10px] font-black uppercase italic cursor-pointer outline-none transition-all ${
                          order.status === 'Paid' ? 'text-blue-500 border-blue-500/40' : 
                          order.status === 'Completed' ? 'text-green-500 border-green-500/40' : 
                          order.status === 'Cancelled' ? 'text-zinc-600 border-zinc-800' :
                          order.status === 'Shipping' ? 'text-orange-500 border-orange-500/40' :
                          'text-yellow-500 border-yellow-500/40'
                        }`}
                      >
                        {statusOptions.map(option => (
                          <option key={option} value={option}>{option.toUpperCase()}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-800 pointer-events-none" />
                    </div>
                  </td>

                  <td className="p-6 text-right text-[10px] font-mono text-zinc-600 uppercase italic">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="py-24 text-center">
               <p className="text-zinc-800 uppercase italic font-black text-sm tracking-[0.5em]">No synchronization found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}