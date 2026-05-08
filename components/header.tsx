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

  // Xử lý click ra ngoài để đóng thông báo
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
    if (!showNotifs) markAllAsRead(); 
    setShowNotifs(!showNotifs);
  };

  return (
    <>
      {/* Sửa bg-black/90 thành bg-background/80 (màu trắng mint nhạt) */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-md border-b border-border font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* LOGO - Chuyển sang chữ Navy và chấm Jade/Mint */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tighter text-foreground uppercase italic">
                HQ<span className="text-primary">.</span>
              </span>
            </Link>

            {/* NAVIGATION */}
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
                    isHoveringProduct ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  Products <ChevronDown className={cn("h-3 w-3 transition-transform", isHoveringProduct && "rotate-180")} />
                </Link>

                {/* MEGA MENU CONTENT - Chuyển sang nền trắng (background) */}
                {isHoveringProduct && (
                  <div className="absolute top-16 left-[-100px] w-[600px] bg-background border border-border shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 p-8 gap-8">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-primary uppercase italic tracking-widest">Categories</p>
                        <ul className="space-y-3">
                          <li><Link href="/products" className="text-sm font-bold uppercase italic text-muted-foreground hover:text-foreground transition-colors">Shop All</Link></li>
                          <li><Link href="/products?category=tshirts" className="text-sm font-bold uppercase italic text-muted-foreground hover:text-foreground transition-colors">T-Shirts</Link></li>
                          <li><Link href="/products?category=hoodies" className="text-sm font-bold uppercase italic text-muted-foreground hover:text-foreground transition-colors">Hoodies</Link></li>
                          <li><Link href="/products?category=pants" className="text-sm font-bold uppercase italic text-muted-foreground hover:text-foreground transition-colors">Pants</Link></li>
                          <li><Link href="/products?category=accessories" className="text-sm font-bold uppercase italic text-muted-foreground hover:text-foreground transition-colors">Accessories</Link></li>
                        </ul>
                      </div>
                      <div className="relative group overflow-hidden bg-muted aspect-video flex items-center justify-center border border-border">
                        <img 
                          src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400" 
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                          alt="New Drop"
                        />
                        <div className="relative z-10 text-center p-4">
                          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary mb-1">New Collection</p>
                          <p className="text-lg font-black uppercase italic leading-none mb-3 text-foreground">Winter 2026</p>
                          <Link href="/products" className="text-[9px] font-black uppercase border-b border-foreground pb-1 italic text-foreground">Discover</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/about" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground hover:text-primary transition-all italic">About</Link>
              <Link href="/news" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground hover:text-primary transition-all italic">News</Link>
              <Link href="/contact" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground hover:text-primary transition-all italic">Contact</Link>
            </nav>

            {/* ACTIONS */}
            <div className="flex items-center gap-2">
              <Link href="/products">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>

              {/* NOTIFICATIONS BOX */}
              {user && (
                <div className="relative" ref={notifRef}>
                  <Button 
                    variant="ghost" size="icon" 
                    className={`text-muted-foreground hover:text-primary ${showNotifs ? 'text-primary' : ''}`}
                    onClick={toggleNotifs} 
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-ping"></span>
                    )}
                  </Button>

                  {showNotifs && (
                    <div className={cn(
                      "fixed md:absolute top-16 md:top-full left-4 right-4 md:left-auto md:right-0 md:w-80 mt-2 md:mt-4",
                      "bg-background border border-border shadow-2xl z-[110] animate-in fade-in slide-in-from-top-2"
                    )}>
                      <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                        <p className="text-[10px] font-black uppercase italic text-foreground tracking-widest">System Alerts</p>
                        <span className="text-[9px] bg-primary px-2 py-0.5 font-black text-primary-foreground">
                          {unreadCount > 0 ? (unreadCount > 5 ? "5+" : unreadCount) : "0"} NEW
                        </span>
                      </div>

                      <div className="max-h-[60vh] md:max-h-80 overflow-y-auto">
                        {notifs.slice(0, 5).map((n) => (
                          <Link 
                            key={n.id} href={n.link || "#"} 
                            className={cn(
                              "block p-4 border-b border-border/50 hover:bg-muted/50 transition-all",
                              n.is_read ? "opacity-60" : "opacity-100 bg-primary/[0.03]"
                            )}
                            onClick={() => setShowNotifs(false)}
                          >
                            <div className="flex gap-3">
                              {n.title === "Admin Phản Hồi" ? 
                                  <MessageSquare size={14} className="text-primary shrink-0" /> : 
                                  <Truck size={14} className="text-secondary shrink-0" />
                              }
                              <div className="min-w-0 flex-1">
                                  <p className="text-[11px] font-black uppercase text-foreground leading-none mb-1 truncate">
                                    {n.title}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground italic leading-tight line-clamp-2">
                                    {n.desc}
                                  </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CART */}
              <Link href="/checkout">
                <Button variant="ghost" size="icon" className={`relative transition-all ${isPulsing ? "scale-125 text-primary" : "text-muted-foreground hover:text-primary"}`}>
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center">{cartCount}</span>}
                </Button>
              </Link>

              {/* USER MENU */}
              <div className="hidden md:flex items-center ml-2 pl-4 border-l border-border">
                {user ? (
                  <div className="relative group py-4">
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase italic text-foreground group-hover:text-primary transition-colors">
                      <div className="h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center">
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                      {user.full_name} <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <div className="absolute top-full right-0 mt-0 w-48 bg-background border border-border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="p-4 border-b border-border bg-muted/20">
                        <p className="text-xs font-black text-foreground truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase text-muted-foreground hover:bg-muted hover:text-foreground transition-all"><User className="h-3 w-3" /> Account Info</Link>
                        <Link href="/orders/history" className="flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase text-muted-foreground hover:bg-muted hover:text-foreground transition-all"><Package className="h-3 w-3" /> Purchase History</Link>
                        <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-2 mt-2 text-[10px] font-black uppercase text-destructive hover:bg-destructive/5 border-t border-border">Logout Account</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href="/login">
                    <span className="text-[10px] uppercase tracking-widest font-black text-foreground hover:text-primary transition-colors italic">Login</span>
                  </Link>
                )}
              </div>

              {/* MOBILE TOGGLE */}
              <Button 
                variant="ghost" size="icon" 
                className="md:hidden text-muted-foreground hover:text-primary" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border p-6 space-y-4 animate-in slide-in-from-top-4">
            <Link href="/products" className="block text-sm font-black uppercase italic text-muted-foreground hover:text-primary">Products</Link>
            <Link href="/about" className="block text-sm font-black uppercase italic text-muted-foreground hover:text-primary">About</Link>
            <Link href="/news" className="block text-sm font-black uppercase italic text-muted-foreground hover:text-primary">News</Link>
            <Link href="/contact" className="block text-sm font-black uppercase italic text-muted-foreground hover:text-primary">Contact</Link>
          </div>
        )}
      </header>
    </>
  );
}