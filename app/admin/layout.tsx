"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Users, Menu, X, Loader2 } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar"; 
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/admin/login") {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) router.push("/admin/login");
      else {
        const user = JSON.parse(storedUser);
        if (user.role !== "admin") router.push("/");
        else setAuthorized(true);
      }
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [pathname]); 

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    if (window.innerWidth < 1024) setIsSidebarOpen(false);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); 

  if (pathname === "/admin/login") return <>{children}</>;

  if (!authorized) {
    return (
      <div className="h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-4 text-[oklch(0.22_0.06_240)] font-black italic uppercase">
        <Loader2 className="animate-spin text-[oklch(0.65_0.1_170)] h-12 w-12" />
        <p className="tracking-[0.5em] text-[10px]">Neural Link Initializing...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#fafafa] font-sans text-[oklch(0.22_0.06_240)] overflow-hidden">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden" 
             onClick={() => setIsSidebarOpen(false)} />
      )}

      <AdminSidebar isOpen={isSidebarOpen} onClose={() => { if(window.innerWidth < 1024) setIsSidebarOpen(false) }} />

      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="h-20 border-b border-zinc-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-zinc-50 cursor-pointer text-[oklch(0.22_0.06_240)] transition-none active:scale-90"
          >
            {/* Nếu đang mở thì hiện X, đang đóng hiện Menu */}
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-6">
             <div className="text-right hidden sm:block leading-none">
               <p className="text-[10px] font-black uppercase italic text-[oklch(0.22_0.06_240)]">Terminal Access</p>
               <p className="text-[8px] font-bold uppercase text-[oklch(0.65_0.1_170)] tracking-widest italic mt-1">v.26 Authorized</p>
             </div>
             <div className="h-10 w-10 bg-zinc-50 border border-zinc-100 flex items-center justify-center rounded-none">
                <Users size={18} className="text-[oklch(0.65_0.1_170)]" />
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-zinc-50/50">
          <div className="max-w-[1600px] mx-auto p-6 md:p-12 animate-in fade-in duration-1000">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}