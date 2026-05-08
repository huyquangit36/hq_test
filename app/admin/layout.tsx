"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, Package, ShoppingCart, Users, 
  BarChart3, LogOut, ArrowLeft, Loader2, MessageSquare, Menu, X 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const router = useRouter();
  const pathname = usePathname();

  // Tự động đóng trên Mobile khi chuyển trang
  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, [pathname]);

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
    if (user.role !== "admin") router.push("/");
    else setAuthorized(true);
  }, [pathname, router]);

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Analytics", href: "/admin/stats", icon: BarChart3 },
    { name: "Inquiries", href: "/admin/comments", icon: MessageSquare },
  ];

  if (pathname === "/admin/login") return <>{children}</>;

  if (!authorized) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground font-black italic uppercase">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
        <p className="tracking-[0.5em] text-[10px]">Accessing Secure Terminal...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background font-sans text-foreground overflow-hidden">
      
      {/* 1. MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* 2. SIDEBAR CONTAINER */}
      <aside className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col shrink-0 z-50 overflow-hidden h-full",
        "fixed inset-y-0 left-0 md:relative",
        
        // THUẬT TOÁN WIDTH: 
        // - Mobile: isSidebarOpen ? 280px : 0px
        // - Tablet (md:lg): LUÔN LUÔN 80px (w-20)
        // - Desktop (lg): isSidebarOpen ? 280px : 80px
        isSidebarOpen 
          ? "w-[280px] lg:w-72 translate-x-0" 
          : "w-0 -translate-x-full md:w-20 md:translate-x-0 lg:w-20",
        
        "md:max-lg:w-20" // ÉP CỨNG TABLET CHỈ HIỆN ICON
      )}>
        
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0 overflow-hidden">
           <Link href="/admin" className="flex items-center gap-3">
             <div className="h-8 w-8 bg-foreground flex items-center justify-center shrink-0">
                <span className="text-background font-black italic text-sm">HQ</span>
             </div>
             <span className={cn(
               "text-xl font-black uppercase italic tracking-tighter transition-all duration-300 whitespace-nowrap",
               !isSidebarOpen ? "opacity-0 invisible" : "opacity-100 visible",
               "md:max-lg:hidden" // Ẩn chữ logo ở tầm tablet
             )}>
                Admin<span className="text-primary">.</span>
             </span>
           </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center transition-all group cursor-pointer relative py-4 px-6",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  // Căn giữa icon khi ở Tablet hoặc khi thu gọn
                  (!isSidebarOpen || (window.innerWidth >= 768 && window.innerWidth < 1024)) && "md:justify-center md:px-0"
                )}
              >
                {isActive && <div className="absolute left-0 w-1 h-6 bg-primary" />}
                
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                
                <span className={cn(
                  "text-[10px] font-black uppercase italic tracking-widest ml-4 transition-all duration-300 whitespace-nowrap",
                  !isSidebarOpen ? "opacity-0 w-0 invisible" : "opacity-100 visible",
                  "md:max-lg:hidden" // Triệt tiêu chữ ở tầm tablet
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar - LUÔN Ở DƯỚI CÙNG */}
        <div className="mt-auto p-4 border-t border-border bg-muted/10 space-y-1">
           <Link href="/" className={cn(
             "flex items-center py-3 px-4 rounded-none transition-all cursor-pointer",
             (!isSidebarOpen || (window.innerWidth >= 768 && window.innerWidth < 1024)) && "md:justify-center md:px-0"
           )}>
              <ArrowLeft size={18} className="text-primary shrink-0" />
              <span className={cn("text-[10px] font-black uppercase italic tracking-widest ml-4", !isSidebarOpen && "hidden", "md:max-lg:hidden")}>Live Shop</span>
           </Link>
           <button 
             onClick={() => { localStorage.clear(); router.push("/admin/login"); }}
             className={cn(
               "w-full flex items-center py-3 px-4 rounded-none transition-all cursor-pointer text-destructive",
               (!isSidebarOpen || (window.innerWidth >= 768 && window.innerWidth < 1024)) && "md:justify-center md:px-0"
             )}
           >
              <LogOut size={18} className="shrink-0" />
              <span className={cn("text-[10px] font-black uppercase italic tracking-widest ml-4", !isSidebarOpen && "hidden", "md:max-lg:hidden")}>Logout</span>
           </button>
        </div>
      </aside>

      {/* 3. CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-muted cursor-pointer text-primary transition-all active:scale-90"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block leading-none">
               <p className="text-[9px] font-black uppercase italic text-foreground">HQ Terminal Access</p>
               <p className="text-[7px] font-bold uppercase text-muted-foreground tracking-widest italic">v.26 Verified</p>
             </div>
             <div className="h-10 w-10 bg-muted border border-border flex items-center justify-center">
                <Users size={18} className="text-primary" />
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-muted/5 selection:bg-primary selection:text-primary-foreground">
          <div className="max-w-[1600px] mx-auto animate-in fade-in duration-1000">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}