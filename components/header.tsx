"use client";

import { useState, useEffect, useRef, memo } from "react";
import Image from "next/image";
import LinkNext from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag, Menu, X, Search, LogOut,
  Package, User, ChevronDown, Bell, MessageSquare, Truck
} from "lucide-react";
import { cn } from "@/lib/utils";

const JADE = "oklch(0.65 0.1 170)";
const NAVY = "oklch(0.22 0.06 240)";
const MINT_BG = "oklch(0.98 0.01 160)";

export const Header = memo(() => {
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
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCartCount = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const total = storedCart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
    setCartCount(total);
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 200);
  };

  const fetchNotifs = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/notifications?userId=${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setNotifs(data);
    } catch (err) { }
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
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await fetch(`/api/user/notifications/read-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
    } catch (err) { }
  };

  const toggleNotifs = () => {
    if (!showNotifs) markAllAsRead();
    setShowNotifs(!showNotifs);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[#fafafa]/90 backdrop-blur-md border-b border-zinc-200 transition-none font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* 01. LOGO */}
          <LinkNext href="/" className="flex items-center gap-2 cursor-pointer transition-none group">
            <span className="text-2xl font-black tracking-tighter text-[oklch(0.22_0.06_240)] uppercase italic transition-none group-hover:text-[oklch(0.65_0.1_170)]">
              HQ<span className="text-[oklch(0.65_0.1_170)]">.</span>
            </span>
          </LinkNext>

          {/* 02. NAVIGATION DESKTOP */}
          <nav className="hidden md:flex items-center gap-10 h-full">
            <div
              className="h-full flex items-center relative"
              onMouseEnter={() => setIsHoveringProduct(true)}
              onMouseLeave={() => setIsHoveringProduct(false)}
            >
              <LinkNext
                href="/products"
                className={cn(
                  "flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] font-black italic transition-none cursor-pointer",
                  isHoveringProduct ? "text-[oklch(0.65_0.1_170)]" : "text-zinc-400 hover:text-black"
                )}
              >
                Archive <ChevronDown className={cn("h-3 w-3 transition-none", isHoveringProduct && "rotate-180")} />
              </LinkNext>

              {isHoveringProduct && (
                <div className="absolute top-20 left-[-150px] w-[650px] bg-white border border-zinc-200 shadow-[20px_20px_0px_rgba(0,0,0,0.05)] rounded-none animate-in fade-in slide-in-from-top-1 duration-0 transition-none">
                  <div className="grid grid-cols-2 p-10 gap-10">
                    <div className="space-y-6">
                      <p className="text-[10px] font-black text-[oklch(0.65_0.1_170)] uppercase italic tracking-[0.3em]">Neural Categories</p>
                      <ul className="space-y-4">
                        {['Shop All', 'T-Shirts', 'Hoodies', 'Pants', 'Accessories'].map(cat => (
                          <li key={cat}>
                            <LinkNext
                              href={`/products${cat !== 'Shop All' ? `?category=${cat.toLowerCase().replace(' ', '')}` : ''}`}
                              className="text-xs font-black uppercase italic text-zinc-400 hover:text-black transition-none block translate-x-0 hover:translate-x-2"
                            >
                              {cat}
                            </LinkNext>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="relative group overflow-hidden bg-zinc-50 border border-zinc-100 rounded-none aspect-video">
                      <img
                        src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500&q=80"
                        className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 transition-none group-hover:scale-105 group-hover:opacity-100"
                        alt="Featured"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.06_240)]/40 to-transparent" />
                      <div className="absolute bottom-6 left-6">
                        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-[oklch(0.65_0.1_170)] mb-1 italic">New Era</p>
                        <p className="text-lg font-black uppercase italic text-white leading-none">Winter 2026</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {['About', 'News', 'Contact'].map(link => (
              <LinkNext
                key={link} href={`/${link.toLowerCase()}`}
                className="text-[11px] uppercase tracking-[0.2em] font-black text-zinc-400 hover:text-black transition-none italic cursor-pointer"
              >
                {link}
              </LinkNext>
            ))}
          </nav>

          {/* 03. ACTIONS */}
          <div className="flex items-center gap-3">
            <LinkNext href="/products">
              <button className="p-2 text-zinc-400 hover:text-black transition-none cursor-pointer">
                <Search className="h-5 w-5" />
              </button>
            </LinkNext>

            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  className={cn(
                    "p-2 transition-none cursor-pointer",
                    showNotifs ? "text-[oklch(0.65_0.1_170)]" : "text-zinc-400 hover:text-black"
                  )}
                  onClick={toggleNotifs}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-none bg-[oklch(0.65_0.1_170)] animate-pulse"></span>
                  )}
                </button>

                {showNotifs && (
                  <div className="fixed md:absolute top-20 md:top-full left-4 right-4 md:left-auto md:right-0 md:w-80 mt-2 bg-white border border-zinc-200 shadow-2xl z-[110] rounded-none transition-none animate-in fade-in duration-0">
                    <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                      <p className="text-[9px] font-black uppercase italic text-zinc-800 tracking-[0.2em]">System Alerts</p>
                      <span className="text-[8px] bg-[oklch(0.65_0.1_170)] px-2 py-0.5 font-black text-white rounded-none">
                        {unreadCount > 0 ? (unreadCount > 5 ? "5+" : unreadCount) : "0"} NEW
                      </span>
                    </div>

                    <div className="max-h-[50vh] md:max-h-80 overflow-y-auto overflow-x-hidden">
                      {notifs.slice(0, 5).map((n) => (
                        <LinkNext
                          key={n.id} href={n.link || "#"}
                          className={cn(
                            "block p-5 border-b border-zinc-50 hover:bg-zinc-50 transition-none",
                            n.is_read ? "opacity-40" : "opacity-100 bg-[oklch(0.65_0.1_170)]/5"
                          )}
                          onClick={() => setShowNotifs(false)}
                        >
                          <div className="flex gap-4">
                            {n.title.includes("Admin") ?
                              <MessageSquare size={14} className="text-[oklch(0.65_0.1_170)] shrink-0" /> :
                              <Truck size={14} className="text-black shrink-0" />
                            }
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black uppercase text-black leading-none mb-1 truncate tracking-tight italic">{n.title}</p>
                              <p className="text-[9px] text-zinc-500 italic leading-tight line-clamp-2">{n.desc}</p>
                            </div>
                          </div>
                        </LinkNext>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <LinkNext href="/checkout">
              <button className={cn(
                "p-2 relative transition-none cursor-pointer",
                isPulsing ? "scale-110 text-[oklch(0.65_0.1_170)]" : "text-zinc-400 hover:text-black"
              )}>
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-none bg-[oklch(0.22_0.06_240)] text-white text-[8px] font-black flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </LinkNext>

            <div className="hidden md:flex items-center ml-2 pl-4 border-l border-zinc-200 h-8">
              {user ? (
                <div className="relative group h-full flex items-center">
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase italic text-zinc-800 group-hover:text-[oklch(0.65_0.1_170)] transition-none cursor-pointer">
                    <div className="h-7 w-7 rounded-none bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                      <User className="h-3 w-3 text-zinc-400" />
                    </div>
                    <span className="max-w-[80px] truncate">{user.full_name}</span>
                    <ChevronDown className="h-3 w-3 text-zinc-400" />
                  </button>
                  <div className="absolute top-full right-0 mt-0 w-52 bg-white border border-zinc-200 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-none translate-y-1 group-hover:translate-y-0 rounded-none z-[120]">
                    <div className="p-5 border-b border-zinc-100 bg-zinc-50/50">
                      <p className="text-[10px] font-black text-black truncate italic">{user.email}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <LinkNext href="/profile" className="flex items-center gap-3 px-4 py-3 text-[9px] font-black uppercase text-zinc-500 hover:bg-zinc-50 hover:text-black transition-none italic"><User className="h-3 w-3" /> Account Archive</LinkNext>
                      <LinkNext href="/orders/history" className="flex items-center gap-3 px-4 py-3 text-[9px] font-black uppercase text-zinc-500 hover:bg-zinc-50 hover:text-black transition-none italic"><Package className="h-3 w-3" /> Orders Link</LinkNext>
                      <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 text-[9px] font-black uppercase text-red-600 hover:bg-red-50 border-t border-zinc-50 italic transition-none">Logout Signal</button>
                    </div>
                  </div>
                </div>
              ) : (
                <LinkNext href="/login" className="text-[10px] uppercase tracking-[0.3em] font-black text-black hover:text-[oklch(0.65_0.1_170)] transition-none italic cursor-pointer">
                  Login
                </LinkNext>
              )}
            </div>

            <button
              className="md:hidden p-2 text-zinc-800 transition-none cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 04. MOBILE MENU WITH OVERLAY */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 z-[200] flex flex-col transition-none">
          {/* PHẦN MENU NỘI DUNG */}
          <div className="bg-white border-b border-zinc-200 p-8 space-y-10 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
            <nav className="flex flex-col gap-6">
              {['Products', 'About', 'News', 'Contact'].map((m) => (
                <LinkNext
                  key={m}
                  href={`/${m.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-black uppercase italic tracking-tighter text-[oklch(0.22_0.06_240)] hover:text-[oklch(0.65_0.1_170)] transition-none"
                >
                  {m}<span className="text-[oklch(0.65_0.1_170)]">.</span>
                </LinkNext>
              ))}
            </nav>

            {/* PHẦN TÀI KHOẢN (IDENTITY) CHO MOBILE */}
            <div className="pt-8 border-t border-zinc-100 flex flex-col gap-6">
              {!user ? (
                <LinkNext href="/login" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase italic text-zinc-400 hover:text-black">
                  Login Protocol
                </LinkNext>
              ) : (
                <div className="space-y-6">
                  {/* CÁC MỤC PROFILE & HISTORY MỚI THÊM VÀO ĐÂY */}
                  <div className="flex flex-col gap-5">
                    <LinkNext href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-black uppercase italic text-zinc-500 hover:text-[oklch(0.65_0.1_170)]">
                      <User size={18} /> Neural Identity
                    </LinkNext>
                    <LinkNext href="/orders/history" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-black uppercase italic text-zinc-500 hover:text-[oklch(0.65_0.1_170)]">
                      <Package size={18} /> Archive History
                    </LinkNext>
                  </div>

                  <div className="pt-6 border-t border-zinc-50 flex flex-col gap-2">
                    <p className="text-[9px] font-black uppercase text-zinc-300 italic tracking-widest">
                      Authorized: {user.full_name}
                    </p>
                    <button onClick={handleLogout} className="text-xl font-black uppercase italic text-red-600 text-left transition-none">
                      Logout Signal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* OVERLAY ĐỂ ĐÓNG MENU */}
          <div
            className="flex-1 bg-[#061421]/20 backdrop-blur-[2px] animate-in fade-in duration-500"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}
    </header>
  );
});

Header.displayName = "Header";