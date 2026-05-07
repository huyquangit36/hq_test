"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Search, X, Loader2, Upload, Pencil, Palette, Tag, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all"); 

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // THUẬT TOÁN: Chuyển stock thành size_stocks object
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    size_stocks: { S: 0, M: 0, L: 0, XL: 0 },
    color: "",
    image_url: ""
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories")
      ]);
      const prods = await prodRes.json();
      const cats = await catRes.json();
      if (Array.isArray(prods)) setProducts(prods);
      if (Array.isArray(cats)) {
        setCategories(cats);
        if (cats.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: cats[0].name }));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper tính tổng stock của tất cả các size
  const getTotalStock = (sizeStocks: any) => {
    if (!sizeStocks) return 0;
    return Object.values(sizeStocks).reduce((acc: number, curr: any) => acc + (parseInt(curr) || 0), 0);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    
    const totalStock = getTotalStock(p.size_stocks);
    let matchesStock = true;
    if (filterStock === "low") matchesStock = totalStock > 0 && totalStock < 10;
    if (filterStock === "out") matchesStock = totalStock <= 0;
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Hàm xử lý thay đổi stock từng size
  const handleSizeStockChange = (size: string, value: string) => {
    setFormData({
      ...formData,
      size_stocks: {
        ...formData.size_stocks,
        [size]: parseInt(value) || 0
      }
    });
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
      }
    } catch (e) { alert("Lỗi thêm danh mục"); }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description || "",
      size_stocks: product.size_stocks || { S: 0, M: 0, L: 0, XL: 0 },
      color: product.color || "",
      image_url: product.image_url
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
    // QUAN TRỌNG: Stringify object size_stocks trước khi gửi
    data.append("size_stocks", JSON.stringify(formData.size_stocks));
    data.append("color", formData.color);
    data.append("currentImage", formData.image_url);
    if (selectedFile) data.append("image", selectedFile);

    try {
      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/admin/products", { method, body: data });
      if (res.ok) {
        await fetchData();
        handleCloseModal();
      }
    } catch (e) { alert("Lỗi lưu sản phẩm"); }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Xóa sản phẩm này?")) {
      await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ 
      name: "", 
      price: "", 
      category: categories[0]?.name || "", 
      description: "", 
      size_stocks: { S: 0, M: 0, L: 0, XL: 0 }, 
      color: "", 
      image_url: "" 
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (loading) return <div className="p-20 text-center text-white italic animate-pulse">Syncing Inventory...</div>;

  return (
    <div className="space-y-8 p-2">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Inventory.</h1>
        <Button onClick={() => setShowModal(true)} className="bg-red-600 rounded-none font-bold uppercase italic px-8">Add Product</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search items..." className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-zinc-800 rounded-none text-white text-sm focus:border-red-600 outline-none" />
        </div>

        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-[#0a0a0a] border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase italic px-4 py-2 outline-none focus:border-red-600"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <select 
          value={filterStock} 
          onChange={(e) => setFilterStock(e.target.value)}
          className="bg-[#0a0a0a] border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase italic px-4 py-2 outline-none focus:border-red-600"
        >
          <option value="all">Availability</option>
          <option value="low">Low Stock (&lt;10)</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      <Card className="bg-[#0a0a0a] border-zinc-800 rounded-none shadow-none">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] font-black uppercase text-zinc-600">
                <th className="p-4">Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Color</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock (S/M/L/XL)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => {
                const total = getTotalStock(p.size_stocks);
                const ss = p.size_stocks || {S:0, M:0, L:0, XL:0};
                return (
                  <tr key={p.id} className="border-b border-zinc-900 hover:bg-zinc-950 transition-colors">
                    <td className="p-4 flex items-center gap-4">
                      <div className="relative h-12 w-12 bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                        <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                      </div>
                      <span className="text-sm font-bold text-white uppercase">{p.name}</span>
                    </td>
                    <td className="p-4 text-xs uppercase text-zinc-500 font-medium">{p.category}</td>
                    <td className="p-4 text-xs uppercase text-zinc-400 italic">{p.color || "-"}</td>
                    <td className="p-4 text-sm font-black text-red-500">${parseFloat(p.price).toFixed(2)}</td>
                    <td className={`p-4 text-[10px] font-mono ${total < 10 ? 'text-red-600 font-bold' : 'text-zinc-400'}`}>
                      <div className="flex gap-2">
                        <span>S:{ss.S}</span><span>M:{ss.M}</span><span>L:{ss.L}</span><span>XL:{ss.XL}</span>
                        <span className="ml-2 text-white font-black">(Total: {total})</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="text-zinc-600 hover:text-white"><Pencil className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-zinc-600 hover:text-red-600"><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-none p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto text-white">
            <div className="flex justify-between mb-8">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">{editingId ? 'Update Item.' : 'New Product.'}</h2>
              <X className="cursor-pointer text-zinc-500 hover:text-white" onClick={handleCloseModal} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500">Image Attachment</label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                    {previewUrl ? <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" /> : <Upload className="h-6 w-6 text-zinc-700"/>}
                  </div>
                  <div className="flex-1">
                    <input type="file" onChange={handleFileChange} className="text-[10px] font-mono text-zinc-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-zinc-500">Name</label>
                   <input className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500">Price ($)</label>
                    <input type="number" step="0.01" className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500">Product Color</label>
                    <input className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                  </div>
                </div>

                {/* PHẦN QUẢN LÝ STOCK THEO SIZE (THAY THẾ Ô STOCK CŨ) */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-zinc-500">Inventory by Size</label>
                   <div className="grid grid-cols-4 gap-2">
                      {['S', 'M', 'L', 'XL'].map((size) => (
                        <div key={size} className="space-y-1">
                          <p className="text-[8px] font-bold text-center text-zinc-600">{size}</p>
                          <input 
                            type="number" 
                            min="0"
                            className="w-full bg-zinc-950 border border-zinc-800 p-2 text-center text-xs focus:border-red-600 outline-none font-mono"
                            value={formData.size_stocks[size as keyof typeof formData.size_stocks]}
                            onChange={(e) => handleSizeStockChange(size, e.target.value)}
                          />
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-zinc-900">
                  <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
                    <Tag className="h-3 w-3" /> Category
                  </label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm uppercase font-bold outline-none focus:border-red-600" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <div className="flex gap-2 pt-2">
                    <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="New category..." className="flex-1 bg-zinc-900 border border-zinc-800 p-2 text-xs outline-none focus:border-zinc-600" />
                    <Button type="button" onClick={handleAddCategory} size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black uppercase">Add</Button>
                  </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-zinc-500">Description</label>
                   <textarea className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm h-24 focus:border-red-600 outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 border-zinc-800 rounded-none uppercase italic font-black text-xs hover:bg-zinc-900" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-none uppercase italic font-black text-xs">Save Drop</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}