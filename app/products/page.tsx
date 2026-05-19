"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ChatButton } from "@/components/chat-button";
import { cn } from "@/lib/utils";

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
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Archive Link Error:", err);
        setLoading(false);
      });
  }, []);

  const dynamicCategories = useMemo(() => {
    if (products.length === 0) return [{ id: "all", name: "All Products" }];
    
    const uniqueCats = Array.from(new Set(products.map(p => p.category)))
      .filter(Boolean)
      .slice(0, 5); 

    return [
      { id: "all", name: "All Products" },
      ...uniqueCats.map(cat => ({
        id: cat.toLowerCase(),
        name: cat.charAt(0).toUpperCase() + cat.slice(1)
      }))
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-background">
      {/* GIỮ NGUYÊN LAYOUT HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-foreground">
            {dynamicCategories.find(c => c.id === selectedCategory)?.name || "Shop All"}.
          </h1>
          <p className="text-muted-foreground mt-2 italic font-medium">
            Archive Sector: <span className="text-primary uppercase font-bold">{selectedCategory}</span>
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="SEARCH ARCHIVE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-muted/20 border border-border rounded-none text-foreground text-sm focus:border-primary outline-none transition-none placeholder:text-muted-foreground/40 font-bold italic"
            autoComplete="one-time-code"
          />
        </div>
      </div>

      {/* RENDER CATEGORY ĐỘNG */}
      <div className="flex flex-wrap gap-3 mb-12">
        {dynamicCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-none border italic cursor-pointer",
              selectedCategory === category.id
                ? "bg-primary border-primary text-primary-foreground shadow-none"
                : "bg-transparent border-border text-muted-foreground hover:border-primary hover:text-primary"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
          <p className="text-[10px] font-black uppercase italic tracking-[0.4em] animate-pulse">Syncing Inventory...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={{
                ...product,
                id: product.id.toString(),
                price: parseFloat(product.price),
                image: product.image_url
              }} />
            ))}
          </div>

          {/* EMPTY STATE */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-32 border border-dashed border-border bg-muted/5">
              <p className="text-muted-foreground italic uppercase font-black text-xs tracking-[0.3em]">No drops detected in this sector.</p>
              <button 
                onClick={() => setSelectedCategory("all")}
                className="mt-6 text-[10px] font-black uppercase border-b-2 border-primary text-primary cursor-pointer hover:opacity-70 transition-none"
              >
                Reset Filters
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
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-primary">
          <Loader2 className="animate-spin h-12 w-12" />
        </div>
      }>
        <ShopContent />
      </Suspense>
      <Footer />
      <ChatButton />
    </div>
  );
}