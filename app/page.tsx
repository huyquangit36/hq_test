"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ChatButton } from "@/components/chat-button";

export default function LandingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- LẤY DỮ LIỆU THẬT TỪ DATABASE ---
useEffect(() => {
  // Đảm bảo đường dẫn này khớp với file vừa tạo ở Bước 1
  fetch("/api/products") 
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setProducts(data);
      }
      setLoading(false);
    })
    .catch((err) => {
      console.error("Lỗi fetch trang chủ:", err);
      setLoading(false);
    });
}, []);

  // Logic lọc: Vì DB có thể chưa có cột isFeatured, ta lấy 4 cái đầu làm Featured
  const featuredProducts = products.slice(0, 4);
  // Lấy 3 cái tiếp theo làm New Arrivals
  const newArrivals = products.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-secondary rounded-full border border-border">
            <span className="text-sm font-medium text-muted-foreground">New Collection 2026</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground uppercase italic">
            HQ<span className="text-red-600">.</span> STREETWEAR
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto italic">
            Premium streetwear for those who refuse to blend in. Live from PostgreSQL database.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 px-8 py-6 text-base font-black italic uppercase">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products (DỮ LIỆU THẬT) */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter">Featured</h2>
              <p className="mt-2 text-muted-foreground italic">Sản phẩm nổi bật từ cửa hàng</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-red-600" /></div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={{
                    ...product,
                    price: parseFloat(product.price), // Đảm bảo giá là số
                    image: product.image_url || "/products/tee-1.jpg" // Dùng ảnh từ DB
                  }} />
                ))
              ) : (
                <p className="col-span-full text-center text-muted-foreground italic">Chưa có sản phẩm nào trong Database.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals (DỮ LIỆU THẬT) */}
      <section className="py-20 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-xs font-bold text-red-600 uppercase tracking-[0.3em]">Just Dropped</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black uppercase italic tracking-tighter text-white">New Arrivals</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={{
                ...product,
                price: parseFloat(product.price),
                image: product.image_url || "/products/tee-1.jpg"
              }} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <ChatButton />
    </div>
  );
}