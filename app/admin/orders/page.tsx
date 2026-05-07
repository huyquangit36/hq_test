"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, ChevronDown, CheckCircle2 } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Danh sách các trạng thái có thể có
  const statusOptions = ["Pending", "Paid", "Shipping", "Completed", "Cancelled"];

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (error) {
      console.error("Lỗi fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // THUẬT TOÁN: Cập nhật trạng thái trực tiếp khi thay đổi Dropdown
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      if (res.ok) {
        // Cập nhật lại state cục bộ để giao diện mượt mà
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      alert("Lỗi hệ thống khi cập nhật trạng thái");
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
    <div className="p-8 space-y-6 bg-black min-h-screen text-white font-sans">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter">Order Hub.</h1>

      {/* THANH BỘ LỌC */}
      <div className="flex flex-wrap gap-4 bg-zinc-950 p-4 border border-zinc-900">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search ID or Customer..." 
            className="w-full pl-10 pr-4 py-2 bg-black border border-zinc-800 text-xs font-bold uppercase outline-none focus:border-red-600" 
          />
        </div>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)} 
          className="bg-black border border-zinc-800 text-[10px] font-black uppercase italic px-4 py-2 outline-none focus:border-red-600 text-zinc-400"
        >
          <option value="all">Filter: All Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Card className="bg-[#0a0a0a] border-zinc-900 rounded-none shadow-none">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] font-black uppercase text-zinc-600 tracking-widest">
                <th className="p-4">ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4 text-center">System Status</th>
                <th className="p-4 text-right">Registry Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-zinc-900 hover:bg-zinc-950 transition-colors">
                  <td className="p-4 font-mono font-bold text-red-600">#ORD-{order.id}</td>
                  <td className="p-4">
                    <p className="text-xs font-black uppercase italic">{order.customer_name || "Guest"}</p>
                    <p className="text-[9px] text-zinc-600 font-bold">{order.customer_email}</p>
                  </td>
                  
                  {/* THUẬT TOÁN: Dropdown thay đổi Status trực tiếp */}
                  <td className="p-4 text-center">
                    <div className="relative inline-block w-32">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`w-full appearance-none bg-black border border-zinc-800 px-3 py-1.5 text-[9px] font-black uppercase italic cursor-pointer outline-none transition-all ${
                          order.status === 'Paid' ? 'text-blue-500 border-blue-500/30' : 
                          order.status === 'Completed' ? 'text-green-500 border-green-500/30' : 
                          order.status === 'Cancelled' ? 'text-zinc-600 border-zinc-800' :
                          order.status === 'Shipping' ? 'text-orange-500 border-orange-500/30' :
                          'text-yellow-500 border-yellow-500/30'
                        }`}
                      >
                        {statusOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-700 pointer-events-none" />
                    </div>
                  </td>

                  <td className="p-4 text-right text-[10px] font-mono text-zinc-500 uppercase">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <p className="p-10 text-center text-zinc-800 uppercase italic font-bold text-xs tracking-widest">No order logs found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}