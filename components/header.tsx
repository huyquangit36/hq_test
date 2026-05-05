"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { getTotalItems, isHydrated } = useCart();

  // Kiểm tra trạng thái đăng nhập từ LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Lỗi đọc dữ liệu user:", error);
      }
    }
  }, []);

  // Hàm xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tighter text-foreground uppercase">
              HQ<span className="text-red-600">.</span>
            </span>
          </Link>

          {/* 2. DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-xs uppercase tracking-widest font-medium text-muted-foreground hover:text-foreground transition-colors">
              Shop All
            </Link>
            <Link href="/products?category=tshirts" className="text-xs uppercase tracking-widest font-medium text-muted-foreground hover:text-foreground transition-colors">
              T-Shirts
            </Link>
            <Link href="/products?category=hoodies" className="text-xs uppercase tracking-widest font-medium text-muted-foreground hover:text-foreground transition-colors">
              Hoodies
            </Link>
            <Link href="/products?category=pants" className="text-xs uppercase tracking-widest font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pants
            </Link>
          </nav>

          {/* 3. RIGHT ACTIONS (SEARCH, CART, AUTH) */}
          <div className="flex items-center gap-2">
            
            {/* NÚT SEARCH - Dẫn sang trang tìm kiếm */}
            <Link href="/products">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </Link>

            {/* NÚT GIỎ HÀNG */}
            <Link href="/checkout">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {isHydrated ? getTotalItems() : 0}
                </span>
              </Button>
            </Link>

            {/* PHẦN AUTH (Desktop) */}
            <div className="hidden md:flex items-center ml-2 pl-4 border-l border-border">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold uppercase tracking-tight italic">
                    {user.full_name || user.email}
                  </span>
                  <button 
                    onClick={handleLogout} 
                    className="text-muted-foreground hover:text-red-600 transition-colors"
                    title="Đăng xuất"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link href="/login">
                  <span className="text-xs uppercase tracking-widest font-bold hover:underline underline-offset-4">
                    Đăng nhập
                  </span>
                </Link>
              )}
            </div>

            {/* NÚT MENU MOBILE */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* 4. MOBILE NAVIGATION (MENU TRÊN ĐIỆN THOẠI) */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-6 border-t border-border bg-background animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-6 px-2">
              <Link href="/products" className="text-sm uppercase tracking-widest font-bold" onClick={() => setMobileMenuOpen(false)}>Shop All</Link>
              <Link href="/products?category=tshirts" className="text-sm uppercase tracking-widest font-bold" onClick={() => setMobileMenuOpen(false)}>T-Shirts</Link>
              <Link href="/products?category=hoodies" className="text-sm uppercase tracking-widest font-bold" onClick={() => setMobileMenuOpen(false)}>Hoodies</Link>
              <Link href="/products?category=pants" className="text-sm uppercase tracking-widest font-bold" onClick={() => setMobileMenuOpen(false)}>Pants</Link>
              
              <div className="pt-6 border-t border-border">
                {/* Phần Search trong Mobile */}
                <Link href="/search" className="flex items-center gap-2 mb-6" onClick={() => setMobileMenuOpen(false)}>
                  <Search className="h-4 w-4" />
                  <span className="text-sm uppercase tracking-widest font-bold">Tìm kiếm</span>
                </Link>

                {/* Phần Auth trong Mobile */}
                {user ? (
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase italic">{user.full_name}</span>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 p-0 h-auto">Thoát</Button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <span className="text-sm uppercase tracking-widest font-bold">Đăng nhập</span>
                  </Link>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}