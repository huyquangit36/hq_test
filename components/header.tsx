"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, Search, LogOut, Package, User, ChevronDown, Bell, MessageSquare, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false); // Toggle khối thông báo
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [notifs, setNotifs] = useState<any[]>([]); // Lưu danh sách thông báo thật
  const [isPulsing, setIsPulsing] = useState(false);
  const router = useRouter();

  const updateCartCount = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const total = storedCart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
    setCartCount(total);
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 300);
  };

  const fetchNotifs = async (userId: string) => {
    const res = await fetch(`/api/user/notifications?userId=${userId}`);
    const data = await res.json();
    setNotifs(data);
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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-md border-b border-zinc-900 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tighter text-white uppercase italic">HQ<span className="text-red-600">.</span></span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/products" className="text-[10px] uppercase tracking-widest font-black text-zinc-500 hover:text-white transition-all">Shop All</Link>
              <Link href="/products?category=tshirts" className="text-[10px] uppercase tracking-widest font-black text-zinc-500 hover:text-white transition-all">T-Shirts</Link>
              <Link href="/products?category=hoodies" className="text-[10px] uppercase tracking-widest font-black text-zinc-500 hover:text-white transition-all">Hoodies</Link>
              <Link href="/products?category=pants" className="text-[10px] uppercase tracking-widest font-black text-zinc-500 hover:text-white transition-all">Pants</Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/products"><Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white"><Search className="h-5 w-5" /></Button></Link>

              {/* KHỐI THÔNG BÁO CHUÔNG */}
              {user && (
                <div className="relative">
                  <Button 
                    variant="ghost" size="icon" 
                    className={`text-zinc-500 hover:text-white ${showNotifs ? 'text-white' : ''}`}
                    onClick={() => setShowNotifs(!showNotifs)}
                  >
                    <Bell className="h-5 w-5" />
                    {notifs.length > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 animate-ping"></span>}
                  </Button>

                  {/* DROPDOWN THÔNG BÁO */}
                  {showNotifs && (
                    <div className="absolute top-full right-0 mt-4 w-80 bg-zinc-950 border border-zinc-900 shadow-2xl animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-zinc-900 flex justify-between items-center">
                        <p className="text-[10px] font-black uppercase italic text-white tracking-widest">System Alerts</p>
                        <span className="text-[9px] bg-red-600 px-2 py-0.5 font-black">{notifs.length} NEW</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifs.map((n) => (
                          <Link 
                            key={n.id} href={n.link} 
                            className="block p-4 border-b border-zinc-900/50 hover:bg-white/5 transition-all"
                            onClick={() => setShowNotifs(false)}
                          >
                            <div className="flex gap-3">
                               {n.title === "Admin Phản Hồi" ? <MessageSquare size={14} className="text-red-600 shrink-0" /> : <Truck size={14} className="text-blue-500 shrink-0" />}
                               <div>
                                  <p className="text-[11px] font-black uppercase text-white leading-none mb-1">{n.title}</p>
                                  <p className="text-[10px] text-zinc-500 italic leading-tight">{n.desc}</p>
                               </div>
                            </div>
                          </Link>
                        ))}
                        {notifs.length === 0 && <p className="p-10 text-center text-zinc-700 text-[10px] font-bold uppercase italic">No new transmissions.</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Link href="/checkout">
                <Button variant="ghost" size="icon" className={`relative transition-all ${isPulsing ? "scale-125 text-red-600" : "text-zinc-500 hover:text-white"}`}>
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">{cartCount}</span>}
                </Button>
              </Link>

              <div className="hidden md:flex items-center ml-2 pl-4 border-l border-zinc-800">
                {user ? (
                  <div className="relative group py-4">
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase italic text-white group-hover:text-red-600 transition-colors">
                      <div className="h-6 w-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center"><User className="h-3 w-3 text-zinc-500" /></div>
                      {user.full_name} <ChevronDown className="h-3 w-3 text-zinc-600" />
                    </button>
                    <div className="absolute top-full right-0 mt-0 w-48 bg-zinc-950 border border-zinc-900 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="p-4 border-b border-zinc-900 bg-black/50"><p className="text-xs font-black text-white truncate">{user.email}</p></div>
                      <div className="p-2">
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"><User className="h-3 w-3" /> Account Info</Link>
                        <Link href="/orders/history" className="flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"><Package className="h-3 w-3" /> Purchase History</Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 mt-2 text-[10px] font-bold uppercase text-red-600 hover:bg-red-600/10 border-t border-zinc-900">Logout Account</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href="/login"><span className="text-[10px] uppercase tracking-widest font-black text-white hover:text-red-600 transition-colors">Login</span></Link>
                )}
              </div>
              <Button variant="ghost" size="icon" className="md:hidden text-zinc-500" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}