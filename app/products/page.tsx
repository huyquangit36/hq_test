"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ChatButton } from "@/components/chat-button";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", name: "All Products" },
  { id: "tshirts", name: "T-Shirts" },
  { id: "hoodies", name: "Hoodies" },
  { id: "pants", name: "Pants" },
];

function ShopContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "all";
  
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-background">
      {/* Header trang Shop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-foreground">
            {categories.find(c => c.id === selectedCategory)?.name || "Shop All"}.
          </h1>
          <p className="text-muted-foreground mt-2 italic font-medium">
            Filtering by: <span className="text-primary uppercase font-bold">{selectedCategory}</span>
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // Thêm cursor-text cho ô nhập liệu
            className="w-full pl-10 pr-4 py-3 bg-muted/20 border border-border rounded-none text-foreground text-sm focus:border-primary outline-none transition-all cursor-text placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Bộ lọc danh mục - Thêm cursor-pointer (hình bàn tay) */}
      <div className="flex flex-wrap gap-3 mb-12">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border italic cursor-pointer",
              selectedCategory === category.id
                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-transparent border-border text-muted-foreground hover:border-primary hover:text-primary"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Danh sách sản phẩm */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
          <p className="text-[10px] font-black uppercase italic tracking-[0.4em] animate-pulse">Syncing Inventory...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 animate-in fade-in duration-700">
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
            <div className="text-center py-32 border border-dashed border-border bg-muted/5">
              <p className="text-muted-foreground italic uppercase font-black text-xs tracking-[0.3em]">No drops found in this archive.</p>
              <button 
                onClick={() => setSelectedCategory("all")}
                className="mt-6 text-[10px] font-black uppercase border-b-2 border-primary text-primary cursor-pointer hover:opacity-70 transition-opacity"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Cập nhật màu loader của Suspense */}
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="animate-spin text-primary h-10 w-10" />
        </div>
      }>
        <ShopContent />
      </Suspense>
      <Footer />
      <ChatButton />
    </div>
  );
}