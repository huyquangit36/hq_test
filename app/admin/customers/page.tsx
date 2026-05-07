"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Pencil, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const fetchCustomers = async () => {
    const res = await fetch("/api/admin/customers");
    const data = await res.json();
    if (Array.isArray(data)) setCustomers(data);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || c.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="p-20 text-center text-white italic animate-pulse">Syncing Database...</div>;

  return (
    <div className="space-y-8 p-2 text-white">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter">Database.</h1>

      <div className="flex flex-wrap gap-4 bg-zinc-950 p-4 border border-zinc-900">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search user..." className="w-full pl-10 pr-4 py-2 bg-black border border-zinc-800 text-xs font-bold uppercase outline-none focus:border-red-600" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="bg-black border border-zinc-800 text-[10px] font-black uppercase italic px-4 py-2">
          <option value="all">All Roles</option>
          <option value="admin">Administrators</option>
          <option value="customer">Customers</option>
        </select>
      </div>

      <Card className="bg-[#0a0a0a] border-zinc-800 rounded-none">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] font-black uppercase text-zinc-600">
                <th className="p-4">User</th>
                <th className="p-4">Access Level</th>
                <th className="p-4">Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(user => (
                <tr key={user.id} className="border-b border-zinc-900 hover:bg-zinc-950 transition-colors">
                  <td className="p-4 font-bold uppercase italic text-sm">{user.full_name}</td>
                  <td className="p-4">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 ${user.role === 'admin' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>{user.role}</span>
                  </td>
                  <td className="p-4 text-[10px] text-zinc-500 font-mono">{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}