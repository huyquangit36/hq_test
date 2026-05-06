"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation"; // Thêm để đọc URL
import { Search, Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ChatButton } from "@/components/chat-button";

const categories = [
  { id: "all", name: "All Products" },
  { id: "tshirts", name: "T-Shirts" },
  { id: "hoodies", name: "Hoodies" },
  { id: "pants", name: "Pants" },
];

// Component nội dung chính của trang Shop
function ShopContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // 1. Đọc tham số ?category= từ URL
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "all";
  
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);

  // 2. Cập nhật selectedCategory mỗi khi URL thay đổi (Bấm từ Header)
  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  // 3. Lấy dữ liệu thật từ Database
  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch sản phẩm:", err);
        setLoading(false);
      });
  }, []);

  // 4. Logic lọc sản phẩm kết hợp Tìm kiếm và Danh mục
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header trang Shop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">
            {categories.find(c => c.id === selectedCategory)?.name || "Shop All"}.
          </h1>
          <p className="text-muted-foreground mt-2 italic font-medium">
            Filtering by: <span className="text-red-600 uppercase font-bold">{selectedCategory}</span>
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-zinc-800 rounded-none text-white text-sm focus:border-red-600 outline-none"
          />
        </div>
      </div>

      {/* Bộ lọc danh mục (Local Filter) */}
      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${
              selectedCategory === category.id
                ? "bg-red-600 border-red-600 text-white"
                : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Danh sách sản phẩm */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-white">
          <Loader2 className="h-10 w-10 animate-spin text-red-600 mb-4" />
          <p className="text-xs font-bold uppercase italic tracking-widest animate-pulse">Syncing Database...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={{
                ...product,
                id: product.id.toString(),
                price: parseFloat(product.price),
                image: product.image_url || "/products/tee-1.jpg"
              }} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-zinc-900">
              <p className="text-zinc-600 italic uppercase font-bold text-xs tracking-widest">No items found in this category.</p>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" /></div>}>
        <ShopContent />
      </Suspense>
      <Footer />
      <ChatButton />
    </div>
  );
}