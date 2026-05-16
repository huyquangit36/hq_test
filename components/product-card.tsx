"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
    size_stocks?: any;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    // Mặc định Quick Add là Size M
    const selectedSize = "M";
    const stockM = product.size_stocks?.[selectedSize] || 0;

    const existingItemIndex = currentCart.findIndex(
      (item: any) => item.id === product.id && item.size === selectedSize
    );
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("AUTHENTICATION REQUIRED", {
        description: "Please login to secure this item in your bag.",
        style: { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--primary)' }
      });
      return;
    }

    const quantityInCart = existingItemIndex > -1 ? currentCart[existingItemIndex].quantity : 0;

    // Kiểm tra kho của Size M với Toast hệ màu sáng
    if (quantityInCart + 1 > stockM) {
      toast.error("OUT OF STOCK", {
        description: `Size M of this product is currently out of stock.`,
        style: { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--destructive)' }
      });
      return;
    }

    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        quantity: 1,
        stock: stockM
      });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cart-updated"));
  
    toast.success("ADDED TO BAG", {
      description: `${product.name} (Size M) added to your drop.`,
      style: { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--primary)' }
    });
  };

  const isMOutOfStock = (product.size_stocks?.M || 0) <= 0;

  return (
    <div className="group relative bg-background border border-border overflow-hidden transition-all duration-500 hover:border-primary/50">      
      <Link href={`/products/${product.id}`} className="cursor-pointer">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <Image
            src={product.image || "/products/tee-1.jpg"}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-transform duration-700 group-hover:scale-110",
              isMOutOfStock && "grayscale opacity-40"
            )}
          />
          
          {/* OVERLAY KHI HOVER */}
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
            <Button 
              onClick={addToCart}
              disabled={isMOutOfStock}
              className={cn(
                "w-40 rounded-none font-black uppercase italic text-[10px] py-6 transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 cursor-pointer",
                isMOutOfStock 
                ? "bg-muted text-muted-foreground cursor-not-allowed border border-border" 
                : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground shadow-xl"
              )}
            >
              {isMOutOfStock ? (
                "Sold Out (M)"
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-4 w-4" /> Quick Add
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-foreground transform translate-y-4 group-hover:translate-y-0 duration-700 delay-75 bg-white/80 px-3 py-1 border border-border">
              <Eye className="h-3 w-3" /> View Archive
            </div>
          </div>

          {/* BADGE HẾT HÀNG - Dùng màu Primary mới */}
          {isMOutOfStock && (
            <div className="absolute top-4 left-4">
               <span className="bg-primary text-primary-foreground text-[8px] font-black uppercase italic px-2 py-1 tracking-widest">Size M Out</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5 space-y-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">
              {product.category || "Authentic Drop"}
            </p>
            <h3 className="text-xs font-black uppercase italic text-foreground tracking-tighter group-hover:text-primary transition-colors leading-none">
              {product.name}
            </h3>
          </div>
          <p className="text-xs font-black italic text-foreground tracking-tighter">
            ${parseFloat(product.price.toString()).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}