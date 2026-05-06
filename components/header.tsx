"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, Search, LogOut, Package, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const router = useRouter();

  const updateCartCount = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const total = storedCart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
    setCartCount(total);
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 300);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
    updateCartCount();

    window.addEventListener("cart-updated", updateCartCount);
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-md border-b border-zinc-900 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                HQ<span className="text-red-600">.</span>
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/products" className="text-[10px] uppercase tracking-widest font-black text-zinc-500 hover:text-white transition-all">Shop All</Link>
              <Link href="/products?category=tshirts" className="text-[10px] uppercase tracking-widest font-black text-zinc-500 hover:text-white transition-all">T-Shirts</Link>
              <Link href="/products?category=hoodies" className="text-[10px] uppercase tracking-widest font-black text-zinc-500 hover:text-white transition-all">Hoodies</Link>
              <Link href="/products?category=pants" className="text-[10px] uppercase tracking-widest font-black text-zinc-500 hover:text-white transition-all">Pants</Link>
            </nav>

            {/* ACTIONS */}
            <div className="flex items-center gap-2">
              <Link href="/products">
                <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white transition-colors">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/checkout">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`relative transition-all duration-300 ${isPulsing ? "scale-125 text-red-600" : "text-zinc-500 hover:text-white"}`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-in zoom-in">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* PHẦN USER - DROPDOWN MENU */}
              <div className="hidden md:flex items-center ml-2 pl-4 border-l border-zinc-800">
                {user ? (
                  <div className="relative group py-4">
                    {/* TRIGGER: Tên người dùng */}
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-tight text-white group-hover:text-red-600 transition-colors">
                      <div className="h-6 w-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <User className="h-3 w-3 text-zinc-500" />
                      </div>
                      {user.full_name}
                      <ChevronDown className="h-3 w-3 text-zinc-600 group-hover:rotate-180 transition-transform duration-300" />
                    </button>

                    {/* DROPDOWN BOX */}
                    <div className="absolute top-full right-0 mt-0 w-48 bg-zinc-950 border border-zinc-900 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="p-4 border-b border-zinc-900 bg-black/50">
                        <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Authentic Member</p>
                        <p className="text-xs font-black text-white truncate">{user.email}</p>
                      </div>
                      
                      <div className="p-2">
                        {/* 1. THÔNG TIN NGƯỜI DÙNG */}
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
                          <User className="h-3 w-3" /> Account Info
                        </Link>
                        
                        {/* 2. LỊCH SỬ MUA HÀNG */}
                        <Link href="/orders/history" className="flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
                          <Package className="h-3 w-3" /> Purchase History
                        </Link>

                        {/* 3. LOGOUT */}
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 mt-2 text-[10px] font-bold uppercase text-red-600 hover:bg-red-600/10 border-t border-zinc-900 transition-all"
                        >
                          <LogOut className="h-3 w-3" /> Logout Account
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href="/login">
                    <span className="text-[10px] uppercase tracking-widest font-black text-white hover:text-red-600 transition-colors">Login</span>
                  </Link>
                )}
              </div>

              {/* MOBILE TOGGLE */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-zinc-500 hover:text-white" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col animate-in fade-in duration-300">
          <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-900">
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">HQ<span className="text-red-600">.</span></span>
            <Button variant="ghost" size="icon" className="text-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-8 w-8" />
            </Button>
          </div>
          
          <nav className="flex flex-col p-8 gap-6">
            <Link href="/products" className="text-lg font-bold uppercase tracking-widest text-white" onClick={() => setMobileMenuOpen(false)}>Shop All</Link>
            
            {user ? (
              <div className="mt-4 pt-8 border-t border-zinc-900 space-y-8">
                <div>
                   <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 text-red-600 italic">User Dashboard</p>
                   <div className="flex flex-col gap-6">
                      {/* MOBILE: THÔNG TIN NGƯỜI DÙNG */}
                      <Link href="/profile" className="text-2xl font-black uppercase italic text-white" onClick={() => setMobileMenuOpen(false)}>Profile Info</Link>
                      
                      {/* MOBILE: LỊCH SỬ MUA HÀNG */}
                      <Link href="/orders/history" className="text-2xl font-black uppercase italic text-white" onClick={() => setMobileMenuOpen(false)}>History</Link>
                      
                      {/* MOBILE: LOGOUT */}
                      <button onClick={handleLogout} className="text-2xl font-black uppercase italic text-red-600 text-left">Sign Out</button>
                   </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="text-2xl font-black uppercase italic text-red-600 mt-4 pt-8 border-t border-zinc-900" onClick={() => setMobileMenuOpen(false)}>Login Account</Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}