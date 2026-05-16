"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Plus, Trash2, Search, X, Loader2, Upload, Pencil, Tag, Database, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all"); 

  // --- THUẬT TOÁN PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false); 
  
  const [formData, setFormData] = useState({
    name: "", price: "", category: "", description: "",
    size_stocks: { S: 0, M: 0, L: 0, XL: 0 }, color: "", image_url: ""
  });

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories")
      ]);
      const prods = await prodRes.json();
      const cats = await catRes.json();
      if (Array.isArray(prods)) setProducts(prods);
      if (Array.isArray(cats)) setCategories(cats);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName) return;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (res.ok) {
        const added = await res.json();
        setCategories([...categories, added]);
        setFormData({ ...formData, category: added.name });
        setNewCategoryName("");
        toast.success("CATEGORY ADDED");
      }
    } catch (e) { toast.error("ADD FAILED"); }
  };

  const getTotalStock = (sizeStocks: any) => {
    if (!sizeStocks) return 0;
    return Object.values(sizeStocks).reduce((acc: number, curr: any) => acc + (parseInt(curr as string) || 0), 0);
  };

  // 1. Lọc sản phẩm trước
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    const totalStock = getTotalStock(p.size_stocks);
    let matchesStock = true;
    if (filterStock === "low") matchesStock = totalStock > 0 && totalStock < 10;
    if (filterStock === "out") matchesStock = totalStock <= 0;
    return matchesSearch && matchesCategory && matchesStock;
  });

  // 2. Tự động về trang 1 khi thực hiện lọc/tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterStock]);

  // 3. Cắt mảng để hiển thị theo trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name, price: product.price.toString(), category: product.category,
      description: product.description || "", size_stocks: product.size_stocks || { S: 0, M: 0, L: 0, XL: 0 },
      color: product.color || "", image_url: product.image_url
    });
    setPreviewUrl(product.image_url);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    if (editingId) data.append("id", editingId);
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("description", formData.description);
    data.append("size_stocks", JSON.stringify(formData.size_stocks));
    data.append("color", formData.color);
    data.append("currentImage", formData.image_url);
    if (selectedFile) data.append("image", selectedFile);

    try {
      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/admin/products", { method, body: data });
      if (res.ok) {
        toast.success("DATABASE UPDATED");
        await fetchData();
        handleCloseModal();
      }
    } catch (e) { toast.error("SYSTEM ERROR"); }
  };

  const handleCloseModal = () => {
    setShowModal(false); setEditingId(null);
    setFormData({ name: "", price: "", category: categories[0]?.name || "", description: "", size_stocks: { S: 0, M: 0, L: 0, XL: 0 }, color: "", image_url: "" });
    setSelectedFile(null); setPreviewUrl(null);
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <>
      <div className="w-full max-w-[1400px] mx-auto space-y-10 py-6 px-4 animate-in fade-in duration-1000">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-border pb-10">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-foreground leading-none">Inventory<span className="text-primary">.</span></h1>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em] italic">Archive Protocol</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-foreground text-background hover:bg-primary h-14 md:h-16 px-10 rounded-none font-black uppercase italic cursor-pointer shadow-xl w-full md:w-auto transition-all">
             New Drop +
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/20 p-4 border border-border">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="SEARCH..." className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-none text-xs font-bold uppercase italic outline-none focus:border-primary" />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-background border border-border text-[10px] font-black uppercase px-4 py-4 outline-none focus:border-primary cursor-pointer">
            <option value="all">CATEGORIES</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>)}
          </select>
          <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="bg-background border border-border text-[10px] font-black uppercase px-4 py-4 outline-none focus:border-primary cursor-pointer">
            <option value="all">AVAILABILITY</option>
            <option value="low">LOW STOCK</option>
            <option value="out">OUT OF STOCK</option>
          </select>
        </div>

        <div className="border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[450px]"> {/* Thêm min-h để không bị giật lag khi chuyển trang ít sản phẩm */}
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-muted/30">
                <tr className="border-b border-border text-[10px] font-black uppercase text-muted-foreground italic">
                  <th className="p-6">Drop Item</th>
                  <th className="p-6">Node</th>
                  <th className="p-6">Value</th>
                  <th className="p-6">Stock</th>
                  <th className="p-6 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="animate-in fade-in duration-500">
                {currentProducts.map(p => {
                  const total = getTotalStock(p.size_stocks);
                  const ss = p.size_stocks || {S:0, M:0, L:0, XL:0};
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors group">
                      <td className="p-6 flex items-center gap-5">
                        <div className="relative h-14 w-12 bg-muted border border-border shrink-0 overflow-hidden">
                          <Image src={p.image_url || "/products/tee-1.jpg"} alt={p.name} fill className="object-cover" />
                        </div>
                        <span className="text-sm font-black text-foreground uppercase italic tracking-tighter">{p.name}</span>
                      </td>
                      <td className="p-6 text-[10px] font-black uppercase text-muted-foreground">{p.category}</td>
                      <td className="p-6 text-sm font-black text-primary italic">${parseFloat(p.price).toFixed(2)}</td>
                      <td className="p-6">
                        <div className="flex gap-4">
                          {['S','M','L','XL'].map(size => (
                             <div key={size} className="text-center min-w-[30px]">
                                <p className="text-[7px] font-black text-muted-foreground">{size}</p>
                                <p className={cn("text-[11px] font-mono font-bold", ss[size] === 0 ? "text-destructive" : "text-foreground")}>{ss[size]}</p>
                             </div>
                          ))}
                          <div className={cn("ml-4 px-3 py-1 text-[9px] font-black italic flex items-center", total < 10 ? "bg-destructive text-white" : "bg-foreground text-background")}>TOTAL: {total}</div>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleEdit(p)} className="p-2 hover:text-primary transition-colors cursor-pointer"><Pencil size={18} /></button>
                          <button onClick={() => {if(confirm("Delete?")) fetch(`/api/admin/products?id=${p.id}`, {method:'DELETE'}).then(()=>fetchData())}} className="p-2 hover:text-destructive transition-colors cursor-pointer"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* --- BỘ ĐIỀU KHIỂN PHÂN TRANG (PAGINATION) --- */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-border bg-muted/5 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase text-muted-foreground italic">
                Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} drops
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="h-10 w-10 border border-border flex items-center justify-center hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "h-10 w-10 font-black italic text-xs transition-all border",
                      currentPage === page 
                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    )}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="h-10 w-10 border border-border flex items-center justify-center hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="p-24 text-center">
               <p className="text-muted-foreground uppercase italic font-black text-xs tracking-[0.5em]">No matching transmissions found.</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. MODAL DÙNG PORTAL - GIỮ NGUYÊN FIX DỨT ĐIỂM */}
      {showModal && mounted && createPortal(
        <div 
          className="fixed inset-0 w-full h-full bg-foreground/60 backdrop-blur-md z-[9999] flex items-start justify-center overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-background border-2 border-foreground w-full max-w-4xl shadow-2xl relative my-4 md:my-10 animate-in zoom-in-95 duration-200 mx-2 md:mx-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-12 space-y-12">
              <div className="flex justify-between items-start border-b-2 border-border pb-8">
                 <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary mb-2">
                       <Database size={16} />
                       <span className="text-[8px] font-black uppercase tracking-[0.4em]">Internal Registry Protocol</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-foreground">
                      {editingId ? 'Edit Product.' : 'New Drop.'}
                    </h2>
                 </div>
                 <button onClick={handleCloseModal} className="h-10 w-10 border-2 border-foreground flex items-center justify-center hover:bg-destructive hover:text-white transition-all cursor-pointer"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase italic border-l-4 border-primary pl-3">Drop Visual</label>
                    <div onClick={() => document.getElementById('file-in')?.click()} className="aspect-video w-full bg-muted/20 border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-all group">
                      {previewUrl ? <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" /> : (
                        <div className="text-center space-y-2">
                           <Upload className="h-8 w-8 text-muted-foreground mx-auto group-hover:text-primary transition-colors" />
                           <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Select Image Asset</p>
                        </div>
                      )}
                    </div>
                    <input id="file-in" type="file" onChange={(e) => {const f=e.target.files?.[0]; if(f){setSelectedFile(f); setPreviewUrl(URL.createObjectURL(f))}}} className="hidden" />
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase italic border-l-4 border-primary pl-3">Stock Allotment</label>
                     <div className="grid grid-cols-4 gap-2 bg-muted/5 p-4 border border-border">
                        {['S', 'M', 'L', 'XL'].map((size) => (
                          <div key={size} className="space-y-1">
                            <p className="text-[9px] font-black text-center text-muted-foreground">{size}</p>
                            <input 
                              type="number" min="0" 
                              className="w-full bg-background border border-border p-3 text-center text-xs font-bold focus:border-primary outline-none" 
                              value={formData.size_stocks[size as keyof typeof formData.size_stocks]} 
                              onChange={(e) => setFormData({...formData, size_stocks: {...formData.size_stocks, [size]: parseInt(e.target.value)||0}})} 
                            />
                          </div>
                        ))}
                     </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-muted-foreground italic">Name</label>
                       <input className="w-full bg-muted/10 border border-border p-4 text-xs font-bold uppercase italic outline-none focus:border-primary" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground italic">Retail ($)</label>
                        <input type="number" step="0.01" className="w-full bg-muted/10 border border-border p-4 text-xs font-bold outline-none focus:border-primary" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground italic">Colorway</label>
                        <input className="w-full bg-muted/10 border border-border p-4 text-xs font-bold outline-none focus:border-primary" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-border">
                       <label className="text-[10px] font-black uppercase italic text-foreground flex items-center gap-2"><Tag size={12} className="text-primary"/> Category Node</label>
                       <select className="w-full bg-muted/10 border border-border p-4 text-[10px] font-black uppercase italic outline-none focus:border-primary cursor-pointer mb-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                          {categories.map(c => <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>)}
                       </select>
                       <div className="flex flex-col sm:flex-row gap-2">
                          <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="NEW TAG..." className="flex-1 bg-background border border-border px-4 text-[10px] font-black uppercase outline-none focus:border-primary" />
                          <button type="button" onClick={handleAddCategory} className="bg-primary text-primary-foreground px-6 py-4 text-[9px] font-black uppercase italic cursor-pointer hover:bg-foreground transition-all">Add Tag</button>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-muted-foreground italic">Context</label>
                       <textarea className="w-full bg-muted/10 border border-border p-4 text-xs font-medium h-32 focus:border-primary outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t-4 border-foreground flex flex-col sm:flex-row gap-4">
                <Button type="button" onClick={handleCloseModal} variant="outline" className="flex-1 border-border rounded-none uppercase font-black italic h-16 cursor-pointer hover:bg-muted">Abort protocol</Button>
                <Button onClick={handleSubmit} className="flex-1 bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-none uppercase font-black italic h-16 cursor-pointer shadow-2xl transition-all">Commit changes</Button>
              </div>
            </div>
          </div>
        </div>,
        document.body 
      )}
    </>
  );
}