"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold uppercase tracking-tighter">Quản lý đơn hàng</h1>
      
      <Card className="bg-card">
        <CardHeader><CardTitle>Danh sách đơn hàng thật ({orders.length})</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left uppercase text-[10px] font-bold text-muted-foreground">
                <th className="p-4">Mã ĐH</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Ngày đặt</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-mono font-bold">#ORD-{order.id}</td>
                  <td className="p-4">
                    <p className="font-medium">{order.customer_name || "Khách vãng lai"}</p>
                    <p className="text-[10px] text-muted-foreground">{order.customer_email}</p>
                  </td>
                  <td className="p-4 font-bold text-red-600">${parseFloat(order.total_amount).toFixed(2)}</td>
                  <td className="p-4">
                    <Badge variant="outline" className="uppercase text-[10px] bg-yellow-500/10 text-yellow-600 border-yellow-600/20">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center p-10 text-muted-foreground italic">Chưa có đơn hàng nào trong Database máy bạn.</p>}
        </CardContent>
      </Card>
    </div>
  );
}