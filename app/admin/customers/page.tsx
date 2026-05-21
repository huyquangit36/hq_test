"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Loader2, UserCheck, ShieldCheck, ChevronLeft, ChevronRight, Mail, UserPlus, X, Lock, Database, ArrowRight, User, Pencil, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [mounted, setMounted] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "", password: "", role: "customer" });

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
    } catch (error) { toast.error("SYNC_ERROR"); }
    finally { setLoading(false); }
  };

  useEffect(() => { setMounted(true); fetchCustomers(); }, []);

  const handleEditClick = (user: any) => {
    setEditingId(user.id);
    setFormData({ full_name: user.full_name, email: user.email, password: "", role: user.role });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { userId: editingId, ...formData } : formData;

    try {
      const res = await fetch("/api/admin/customers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        toast.success(editingId ? "PROFILE UPDATED" : "MEMBER CREATED");
        fetchCustomers();
        handleCloseModal();
      } else {
        const err = await res.json();
        toast.error(err.error || "OPERATION FAILED");
      }
    } catch (e) { toast.error("CONNECTION ERROR"); }
    finally { setIsSubmitting(false); }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ full_name: "", email: "", password: "", role: "customer" });
  };

  // LOGIC LỌC & PHÂN TRANG
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || c.role === filterRole;
    return matchesSearch && matchesRole;
  });

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterRole]);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage === 1) return [1, 2, 3];
    if (currentPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 1, currentPage, currentPage + 1];
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-background text-primary"><Loader2 className="animate-spin h-10 w-10" /></div>;

  return (
    <div className="w-[95%] lg:w-[90%] mx-auto space-y-10 py-10 animate-in fade-in duration-700">
      <Toaster position="top-center" theme="light" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-border pb-10">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-foreground leading-none">Member Hub<span className="text-primary">.</span></h1>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em] italic pl-1">Personnel Management // Data Analysis</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-foreground text-background hover:bg-primary h-16 px-10 rounded-none font-black uppercase italic cursor-pointer shadow-xl">
          <UserPlus className="mr-3 h-5 w-5" /> New Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/20 p-4 border border-border">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="SEARCH ARCHIVE..." className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-none text-xs font-bold uppercase italic focus:border-primary outline-none" />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="bg-background border border-border text-[10px] font-black uppercase italic px-6 py-4 outline-none focus:border-primary cursor-pointer text-muted-foreground">
          <option value="all">ALL PRIVILEGES</option>
          <option value="admin">ADMINS</option>
          <option value="customer">MEMBERS</option>
        </select>
      </div>

      <div className="border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-border bg-muted/10 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] italic">
                <th className="p-6">Entity Identity</th>
                <th className="p-6">Status</th>
                <th className="p-6">Wallet Specs</th>
                <th className="p-6">Contact Metadata</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="animate-in fade-in duration-500">
              {currentCustomers.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-all">
                  <td className="p-6 flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-xs text-primary italic">{user.full_name.charAt(0)}</div>
                    <span className="text-sm font-black text-foreground uppercase italic tracking-tighter">{user.full_name}</span>
                  </td>
                  <td className="p-6">
                    <span className={cn("text-[9px] font-black uppercase px-3 py-1.5", user.role === 'admin' ? "bg-foreground text-background" : "bg-muted text-muted-foreground")}>{user.role}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-center border-r border-border pr-4">
                        <p className="text-[7px] font-black text-muted-foreground uppercase">Drops</p>
                        <p className="text-xs font-bold text-foreground">{user.order_count}</p>
                      </div>
                      <div>
                        <p className="text-[7px] font-black text-muted-foreground uppercase">Invested</p>
                        <p className="text-xs font-bold text-primary italic">${parseFloat(user.total_spent).toFixed(2)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6"><div className="flex items-center gap-2 text-muted-foreground"><Mail size={12} className="text-primary" /><span className="text-[10px] font-bold lowercase">{user.email}</span></div></td>
                  <td className="p-6 text-right">
                    <button onClick={() => handleEditClick(user)} className="p-2 hover:text-primary transition-all cursor-pointer"><Pencil size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION MAX 3 SLOTS */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase text-muted-foreground italic">Personnel {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length}</p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="h-10 w-10 border border-border flex items-center justify-center hover:bg-muted disabled:opacity-20 cursor-pointer bg-background"><ChevronLeft size={16} /></button>
              {currentPage > 2 && <span className="text-[10px] font-black px-2">...</span>}
              {getPageNumbers().map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} className={cn("h-10 w-10 font-black text-xs border cursor-pointer transition-all", currentPage === page ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground")}>{page}</button>
              ))}
              {currentPage < totalPages - 1 && <span className="text-[10px] font-black px-2">...</span>}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="h-10 w-10 border border-border flex items-center justify-center hover:bg-muted disabled:opacity-20 cursor-pointer bg-background"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT/ADD MODAL - FIX DỨT ĐIỂM */}
      {showModal && mounted && createPortal(
        <div className="fixed inset-0 w-full h-full bg-foreground/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div className="bg-background border-2 border-foreground w-full max-w-xl shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 md:p-12 space-y-10">
              <div className="flex justify-between items-start border-b-2 border-border pb-6">
                <div>
                  <div className="flex items-center gap-3 text-primary mb-2"><ShieldCheck size={16} /><span className="text-[8px] font-black uppercase tracking-[0.4em]">Internal Registry Protocol</span></div>
                  <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">{editingId ? 'Edit Profile.' : 'New Member.'}</h2>
                </div>
                <button onClick={handleCloseModal} className="h-10 w-10 border-2 border-foreground flex items-center justify-center hover:bg-destructive hover:text-white transition-all cursor-pointer"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase italic text-muted-foreground">Full Name Identity</label>
                  <input className="w-full bg-muted/10 border border-border p-5 text-sm font-bold uppercase italic outline-none focus:border-primary" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required />
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase italic text-muted-foreground">Email Connection</label>
                  <input type="email" className="w-full bg-muted/10 border border-border p-5 text-sm font-bold outline-none focus:border-primary" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase italic text-muted-foreground">Access Key {editingId && "(Optional)"}</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-muted/10 border border-border p-5 text-sm font-bold outline-none focus:border-primary" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!editingId} />
                  </div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase italic text-muted-foreground">Level</label>
                    <select className="w-full bg-muted/10 border border-border p-5 text-[10px] font-black uppercase italic outline-none focus:border-primary cursor-pointer" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                      <option value="customer">CUSTOMER</option><option value="admin">ADMIN</option>
                    </select>
                  </div>
                </div>
                <div className="pt-6 border-t-2 border-foreground flex gap-4">
                  <Button type="button" onClick={handleCloseModal} variant="outline" className="flex-1 border-border rounded-none uppercase font-black italic h-16 cursor-pointer hover:bg-muted">Abort</Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1 bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-none uppercase font-black italic h-16 cursor-pointer shadow-xl">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Commit protocol"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
}