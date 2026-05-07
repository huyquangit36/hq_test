"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  LogOut, 
  ArrowLeft,
  Loader2,
  MessageSquare // Icon cho phần Inquiry
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") {
      setAuthorized(true);
      return;
    }
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/admin/login");
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.role !== "admin") {
      router.push("/");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/admin/login");
  };

  // DANH SÁCH MENU SIDEBAR - ĐÃ THÊM MỤC INQUIRIES ĐỂ CHECK
  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Analytics", href: "/admin/stats", icon: BarChart3 },
    { name: "Inquiries", href: "/admin/comments", icon: MessageSquare }, // NÚT ĐỂ CHECK BÌNH LUẬN CŨ/MỚI
  ];

  if (pathname === "/admin/login") return <>{children}</>;

  if (!authorized) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4 text-white font-black italic uppercase">
        <Loader2 className="animate-spin text-red-600 h-10 w-10" />
        <p>Verifying Access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-8 border-b border-zinc-900">
           <Link href="/admin" className="text-2xl font-black uppercase italic tracking-tighter">
             HQ<span className="text-red-600">.</span>ADMIN
           </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase italic tracking-widest transition-all ${
                  isActive 
                  ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]" 
                  : "text-zinc-500 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-900 space-y-2">
           <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase text-red-600 hover:bg-red-600/10 transition-all">
              <LogOut size={14} /> Exit Terminal
           </button>
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <main className="p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}