"use client";
import { useEffect, useState } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error("Lỗi:", err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý khách hàng (Dữ liệu PostgreSQL)</h1>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted uppercase text-xs">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Họ tên</th>
              <th className="p-4">Email</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((user: any) => (
              <tr key={user.id} className="border-t">
                <td className="p-4">{user.id}</td>
                <td className="p-4 font-medium">{user.full_name}</td>
                <td className="p-4">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}