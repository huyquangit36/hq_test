"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  BarChart3, MessageSquare, Newspaper, LogOut, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: "OVERVIEW", href: "/admin", icon: LayoutDashboard },
  { name: "PRODUCTS", icon: Package, href: "/admin/products" },
  { name: "ORDERS", icon: ShoppingCart, href: "/admin/orders" },
  { name: "CUSTOMERS", icon: Users, href: "/admin/customers" },
  { name: "EDITORIAL", icon: Newspaper, href: "/admin/news" },
  { name: "ANALYTICS", icon: BarChart3, href: "/admin/stats" },
  { name: "INQUIRIES", icon: MessageSquare, href: "/admin/comments" },
];

export function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "bg-white border-r border-zinc-100 transition-all duration-300 flex flex-col shrink-0 z-50 overflow-hidden h-full",
      "fixed inset-y-0 left-0 lg:relative",
      isOpen ? "w-[280px] translate-x-0" : "w-0 -translate-x-full lg:w-20 lg:translate-x-0",
    )}>

      {/* Logo Section */}
      <div className={cn(
        "h-20 flex items-center border-b border-zinc-50 shrink-0 px-6",
        !isOpen && "lg:justify-center lg:px-0"
      )}>
        <Link href="/admin" className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[oklch(0.22_0.06_240)] flex items-center justify-center shrink-0">
            <span className="text-white font-black italic text-xs">HQ</span>
          </div>
          {/* DÙNG HIDDEN KHI ĐÓNG */}
          {isOpen && (
            <span className="text-xl font-black uppercase italic tracking-tighter text-[oklch(0.22_0.06_240)] animate-in fade-in duration-300">
              Admin<span className="text-[oklch(0.65_0.1_170)]">.</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 flex flex-col gap-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center transition-none group cursor-pointer relative py-4 px-7",
                isActive ? "text-[oklch(0.65_0.1_170)]" : "text-zinc-400 hover:text-black",
                !isOpen && "lg:justify-center lg:px-0"
              )}
            >
              {isActive && <div className="absolute left-0 w-1 h-6 bg-[oklch(0.65_0.1_170)]" />}

              <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-[oklch(0.65_0.1_170)]")} />

              {/* DÙNG HIDDEN KHI ĐÓNG ĐỂ ICON KHÔNG BỊ LỆCH MARGIN */}
              {isOpen && (
                <span className="text-[10px] font-black uppercase italic tracking-[0.2em] ml-4 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-zinc-50 bg-zinc-50/30">
        <Link href="/" className={cn(
          "flex items-center py-3 px-4 transition-none cursor-pointer text-zinc-400 hover:text-black",
          !isOpen && "lg:justify-center lg:px-0"
        )}>
          <ArrowLeft size={16} />
          {isOpen && <span className="text-[10px] font-black uppercase italic tracking-widest ml-4 animate-in fade-in duration-300">Live Shop</span>}
        </Link>
      </div>
    </aside>
  );
}