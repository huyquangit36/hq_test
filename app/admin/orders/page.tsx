"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    if (Array.isArray(data)) setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  // THUẬT TOÁN: Gọi API để duyệt đơn
  const updateStatus = async (orderId: number, newStatus: string) => {
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      body: JSON.stringify({ orderId, status: newStatus })
    });
    if (res.ok) {
      alert("Đã duyệt đơn hàng #" + orderId);
      fetchOrders(); // Load lại danh sách
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline text-red-600" /></div>;

  return (
    <div className="p-8 space-y-6 bg-black min-h-screen text-white">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter">Order Control.</h1>
      
      <Card className="bg-[#0a0a0a] border-zinc-900 rounded-none">
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] font-black uppercase text-zinc-600">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Address</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-zinc-900 hover:bg-zinc-950 transition-colors">
                  <td className="p-4 font-mono font-bold">#ORD-{order.id}</td>
                  <td className="p-4">
                    <p className="text-sm font-bold uppercase">{order.customer_name}</p>
                    <p className="text-[10px] text-zinc-500">{order.customer_email}</p>
                  </td>
                  <td className="p-4 text-xs text-zinc-400 italic">{order.shipping_address}</td>
                  <td className="p-4">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 ${order.status === 'Paid' ? 'bg-green-600/20 text-green-500' : 'bg-yellow-600/20 text-yellow-500'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {order.status === 'Pending' && (
                      <Button 
                        onClick={() => updateStatus(order.id, 'Paid')}
                        className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase italic h-8 rounded-none"
                      >
                        Confirm & Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}