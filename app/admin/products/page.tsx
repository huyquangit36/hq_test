"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Search, X, Loader2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  // State phục vụ cho việc Upload ảnh
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "tshirts",
    description: "",
    stock: "50",
  });

  // --- 1. LẤY DỮ LIỆU TỪ DATABASE ---
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Lỗi fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- 2. XỬ LÝ CHỌN FILE ẢNH ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Tạo link ảnh tạm thời để xem trước
    }
  };

  // --- 3. THÊM SẢN PHẨM MỚI (Dùng FormData để gửi File) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("description", formData.description);
    data.append("stock", formData.stock);
    
    if (selectedFile) {
      data.append("image", selectedFile); // Đính kèm file ảnh
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: data, // Gửi FormData lên Backend
      });

      if (res.ok) {
        fetchProducts(); // Load lại danh sách sản phẩm
        handleCloseModal();
      } else {
        alert("Có lỗi xảy ra khi thêm sản phẩm.");
      }
    } catch (error) {
      console.error("Lỗi submit:", error);
      alert("Lỗi kết nối API.");
    }
  };

  // --- 4. XÓA SẢN PHẨM ---
  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      try {
        const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          setProducts(products.filter((p) => p.id !== id));
        }
      } catch (error) {
        alert("Lỗi khi xóa");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: "", price: "", category: "tshirts", description: "", stock: "50" });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20 text-white italic">
        <Loader2 className="animate-spin mr-2" /> Loading inventory...
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Inventory.</h1>
          <p className="text-zinc-500 text-sm font-medium mt-1">Quản lý kho sản phẩm từ PostgreSQL</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)} 
          className="bg-red-600 text-white hover:bg-red-700 uppercase font-bold italic rounded-none px-6"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-zinc-800 rounded-none text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600"
        />
      </div>

      {/* Products Table */}
      <Card className="bg-[#0a0a0a] border-zinc-800 shadow-none rounded-none">
        <CardHeader>
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            All Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-900 text-left">
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-zinc-600">Sản phẩm</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-zinc-600">Danh mục</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-zinc-600">Giá</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-zinc-600">Kho</th>
                  <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider text-zinc-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-950 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 bg-zinc-900 border border-zinc-800 overflow-hidden">
                          <Image 
                            src={product.image_url || "/products/tee-1.jpg"} 
                            alt={product.name} 
                            fill 
                            className="object-cover hover:scale-110 transition-transform duration-300" 
                          />
                        </div>
                        <span className="text-sm font-bold text-white uppercase">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs uppercase font-medium text-zinc-500">{product.category}</span>
                    </td>
                    <td className="py-4 px-4 text-sm font-black text-red-500">
                      ${parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-sm font-mono text-zinc-400">
                      {product.stock}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(product.id)} 
                        className="text-zinc-600 hover:text-red-600 hover:bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <p className="text-center p-10 text-zinc-700 text-sm italic">No products found in database.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Product Modal (Hỗ trợ Đính kèm tệp) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-none p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between mb-8">
              <h2 className="text-xl font-bold uppercase italic text-white tracking-tighter">Attach Product.</h2>
              <X className="cursor-pointer text-zinc-500 hover:text-white" onClick={handleCloseModal} />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Ô TẢI ẢNH (ATTACHMENT) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Product Image</label>
                <div className="flex items-center gap-4">
                   <div className="h-20 w-20 border border-zinc-800 flex items-center justify-center overflow-hidden bg-zinc-900 relative">
                      {previewUrl ? (
                        <img src={previewUrl} className="object-cover h-full w-full" alt="Preview" />
                      ) : (
                        <Upload className="text-zinc-700 h-5 w-5" />
                      )}
                   </div>
                   <div className="flex-1">
                     <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="text-xs text-zinc-500 file:mr-4 file:py-1.5 file:px-3 file:border file:border-zinc-700 file:bg-transparent file:text-white file:text-xs file:font-bold file:uppercase file:cursor-pointer hover:file:bg-zinc-800 file:transition-colors"
                     />
                     <p className="text-[9px] text-zinc-600 mt-2 italic">* Upload square images for best results.</p>
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Product Name</label>
                <input className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-none text-white text-sm focus:border-zinc-600 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Price ($)</label>
                  <input type="number" step="0.01" className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-none text-white text-sm focus:border-zinc-600 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Stock</label>
                  <input type="number" className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-none text-white text-sm focus:border-zinc-600 outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Category</label>
                <select className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-none text-white text-sm focus:border-zinc-600 outline-none appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="tshirts">T-Shirts</option>
                  <option value="hoodies">Hoodies</option>
                  <option value="pants">Pants</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1 border-zinc-800 text-white rounded-none uppercase font-bold text-xs hover:bg-zinc-900" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-red-600 text-white rounded-none uppercase font-bold text-xs hover:bg-red-700">Upload & Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}