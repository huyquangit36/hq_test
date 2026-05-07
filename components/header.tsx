"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, Search, LogOut, Package, User, ChevronDown, Bell, MessageSquare, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isHoveringProduct, setIsHoveringProduct] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [isPulsing, setIsPulsing] = useState(false);
  const unreadCount = notifs.filter(n => !n.is_read).length;
  
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCartCount = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const total = storedCart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
    setCartCount(total);
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 300);
  };

  const fetchNotifs = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/notifications?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setNotifs(data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      fetchNotifs(u.id);
    }
    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    return () => window.removeEventListener("cart-updated", updateCartCount);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    
    const updatedNotifs = notifs.map(n => ({ ...n, is_read: true }));
    setNotifs(updatedNotifs);

    
    try {
      await fetch(`/api/user/notifications/read-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  
  const toggleNotifs = () => {
    if (!showNotifs) {
      markAllAsRead(); 
    }
    setShowNotifs(!showNotifs);
  };


  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-md border-b border-zinc-900 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                HQ<span className="text-red-600">.</span>
              </span>
            </Link>

            {/* NAVIGATION - MEGA MENU ON HOVER */}
            <nav className="hidden md:flex items-center gap-8 h-full">
              <div 
                className="h-full flex items-center relative"
                onMouseEnter={() => setIsHoveringProduct(true)}
                onMouseLeave={() => setIsHoveringProduct(false)}
              >
                <Link 
                  href="/products" 
                  className={cn(
                    "flex items-center gap-1 text-[10px] uppercase tracking-widest font-black italic transition-all",
                    isHoveringProduct ? "text-red-600" : "text-zinc-500 hover:text-white"
                  )}
                >
                  Products <ChevronDown className={cn("h-3 w-3 transition-transform", isHoveringProduct && "rotate-180")} />
                </Link>

                {/* MEGA MENU CONTENT */}
                {isHoveringProduct && (
                  <div className="absolute top-16 left-[-100px] w-[600px] bg-zinc-950 border border-zinc-900 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 p-8 gap-8">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-red-600 uppercase italic tracking-widest">Categories</p>
                        <ul className="space-y-3">
                          <li><Link href="/products" className="text-sm font-bold uppercase italic text-zinc-400 hover:text-white transition-colors">Shop All</Link></li>
                          <li><Link href="/products?category=tshirts" className="text-sm font-bold uppercase italic text-zinc-400 hover:text-white transition-colors">T-Shirts</Link></li>
                          <li><Link href="/products?category=hoodies" className="text-sm font-bold uppercase italic text-zinc-400 hover:text-white transition-colors">Hoodies</Link></li>
                          <li><Link href="/products?category=pants" className="text-sm font-bold uppercase italic text-zinc-400 hover:text-white transition-colors">Pants</Link></li>
                          <li><Link href="/products?category=accessories" className="text-sm font-bold uppercase italic text-zinc-400 hover:text-white transition-colors">Accessories</Link></li>
                        </ul>
                      </div>
                      <div className="relative group overflow-hidden bg-zinc-900 aspect-video flex items-center justify-center">
                        <img 
                          src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400" 
                          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
                          alt="New Drop"
                        />
                        <div className="relative z-10 text-center p-4">
                          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-red-600 mb-1">New Collection</p>
                          <p className="text-lg font-black uppercase italic leading-none mb-3 text-white">Winter 2026</p>
                          <Link href="/products" className="text-[9px] font-black uppercase border-b border-white pb-1 italic">Discover</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/about" className="text-[10px] uppercase tracking-widest font-black text-zinc-500 hover:text-white transition-all italic">About</Link>
              <Link href="/news" className="text-[10px] uppercase tracking-widest font-black text-zinc-500 hover:text-white transition-all italic">News</Link>
              <Link href="/contact" className="text-[10px] uppercase tracking-widest font-black text-zinc-500 hover:text-white transition-all italic">Contact</Link>
            </nav>

            {/* ACTIONS */}
            <div className="flex items-center gap-2">
              <Link href="/products">
                <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>

            {/* NOTIFICATIONS BOX */}
            {user && (
              <div className="relative" ref={notifRef}>
                <Button 
                  variant="ghost" size="icon" 
                  className={`text-zinc-500 hover:text-white ${showNotifs ? 'text-white' : ''}`}
                  onClick={toggleNotifs} 
                >
                  <Bell className="h-5 w-5" />
                  {/* CHỈ HIỆN CHẤM ĐỎ NẾU CÓ THÔNG BÁO CHƯA ĐỌC */}
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
                  )}
                </Button>

                {showNotifs && (
                  <div className={cn(
                    "fixed md:absolute top-16 md:top-full left-4 right-4 md:left-auto md:right-0 md:w-80 mt-2 md:mt-4",
                    "bg-zinc-950 border border-zinc-900 shadow-2xl z-[110] animate-in fade-in slide-in-from-top-2"
                  )}>
                    <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-black">
                      <p className="text-[10px] font-black uppercase italic text-white tracking-widest">System Alerts</p>
                      {/* Badge hiện số lượng chưa đọc lúc chưa click, hoặc 0 sau khi click */}
                      <span className="text-[9px] bg-red-600 px-2 py-0.5 font-black text-white">
                        {unreadCount > 0 ? (unreadCount > 5 ? "5+" : unreadCount) : "0"} NEW
                      </span>
                    </div>

                    <div className="max-h-[60vh] md:max-h-80 overflow-y-auto">
                      {notifs.slice(0, 5).map((n) => (
                        <Link 
                          key={n.id} href={n.link || "#"} 
                          // Thêm độ mờ cho các thông báo đã đọc
                          className={cn(
                            "block p-4 border-b border-zinc-900/50 hover:bg-white/5 transition-all",
                            n.is_read ? "opacity-60" : "opacity-100 bg-white/[0.02]"
                          )}
                          onClick={() => setShowNotifs(false)}
                        >
                          <div className="flex gap-3">
                            {n.title === "Admin Phản Hồi" ? 
                                <MessageSquare size={14} className="text-red-600 shrink-0" /> : 
                                <Truck size={14} className="text-blue-500 shrink-0" />
                            }
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-black uppercase text-white leading-none mb-1 truncate">
                                  {n.title}
                                </p>
                                <p className="text-[10px] text-zinc-500 italic leading-tight line-clamp-2">
                                  {n.desc}
                                </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                      
                      {/* ... (phần Footer View all và No transmissions giữ nguyên) */}
                    </div>
                  </div>
                )}
              </div>
            )}

              {/* CART */}
              <Link href="/checkout">
                <Button variant="ghost" size="icon" className={`relative transition-all ${isPulsing ? "scale-125 text-red-600" : "text-zinc-500 hover:text-white"}`}>
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">{cartCount}</span>}
                </Button>
              </Link>

              {/* USER MENU */}
              <div className="hidden md:flex items-center ml-2 pl-4 border-l border-zinc-800">
                {user ? (
                  <div className="relative group py-4">
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase italic text-white group-hover:text-red-600 transition-colors">
                      <div className="h-6 w-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <User className="h-3 w-3 text-zinc-500" />
                      </div>
                      {user.full_name} <ChevronDown className="h-3 w-3 text-zinc-600" />
                    </button>
                    <div className="absolute top-full right-0 mt-0 w-48 bg-zinc-950 border border-zinc-900 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="p-4 border-b border-zinc-900 bg-black/50">
                        <p className="text-xs font-black text-white truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"><User className="h-3 w-3" /> Account Info</Link>
                        <Link href="/orders/history" className="flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"><Package className="h-3 w-3" /> Purchase History</Link>
                        <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-2 mt-2 text-[10px] font-black uppercase text-red-600 hover:bg-red-600/10 border-t border-zinc-900">Logout Account</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href="/login">
                    <span className="text-[10px] uppercase tracking-widest font-black text-white hover:text-red-600 transition-colors italic">Login</span>
                  </Link>
                )}
              </div>

              {/* MOBILE TOGGLE */}
              <Button 
                variant="ghost" size="icon" 
                className="md:hidden text-zinc-500" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU (Cơ bản) */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-zinc-950 border-t border-zinc-900 p-6 space-y-4 animate-in slide-in-from-top-4">
            <Link href="/products" className="block text-sm font-black uppercase italic text-zinc-400">Products</Link>
            <Link href="/about" className="block text-sm font-black uppercase italic text-zinc-400">About</Link>
            <Link href="/news" className="block text-sm font-black uppercase italic text-zinc-400">News</Link>
            <Link href="/contact" className="block text-sm font-black uppercase italic text-zinc-400">Contact</Link>
          </div>
        )}
      </header>
    </>
  );
}