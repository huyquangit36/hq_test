"use client";

import { useCallback, memo } from "react";
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
  priority?: boolean;
}

export const ProductCard = memo(({ product, priority = false }: ProductCardProps) => {
  const isMOutOfStock = (product.size_stocks?.M || 0) <= 0;

  const addToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("AUTHENTICATION REQUIRED", {
        description: "PLEASE LOGIN TO SECURE THIS ITEM.",
        style: { borderRadius: 0, background: 'oklch(0.22 0.06 240)', color: 'white' }
      });
      return;
    }

    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const selectedSize = "M";
    const stockM = product.size_stocks?.[selectedSize] || 0;

    const existingItemIndex = currentCart.findIndex(
      (item: any) => item.id === product.id && item.size === selectedSize
    );

    const quantityInCart = existingItemIndex > -1 ? currentCart[existingItemIndex].quantity : 0;

    if (quantityInCart + 1 > stockM) {
      toast.error("ARCHIVE EMPTY", {
        description: `SIZE M IS CURRENTLY OUT OF STOCK.`,
        style: { borderRadius: 0, border: '1px solid oklch(0.65 0.1 170)' }
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
      description: `${product.name.toUpperCase()} (M) LINKED.`,
      style: { borderRadius: 0, background: 'oklch(0.65 0.1 170)', color: 'white' }
    });
  }, [product]);

  return (
    <div className="group relative bg-white border border-zinc-100 rounded-none overflow-hidden transition-none hover:border-[oklch(0.65_0.1_170)]">
      <Link href={`/products/${product.id}`} className="cursor-pointer">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#fafafa]">
          <Image
            src={product.image || "/products/404.png"}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
            className={cn(
              "object-cover transition-none group-hover:scale-105",
              isMOutOfStock && "grayscale opacity-30"
            )}
          />

          <div className="absolute inset-0 bg-[oklch(0.22_0.06_240)]/10 opacity-0 group-hover:opacity-100 transition-none flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
            <Button
              onClick={addToCart}
              disabled={isMOutOfStock}
              className={cn(
                "w-36 rounded-none font-black uppercase italic text-[9px] py-6 transition-none cursor-pointer",
                isMOutOfStock
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed border-none"
                  : "bg-[oklch(0.22_0.06_240)] text-white hover:bg-[oklch(0.65_0.1_170)] shadow-none"
              )}
            >
              {isMOutOfStock ? "ARCHIVE EMPTY" : "QUICK ADD (M)"}
            </Button>

            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-[oklch(0.22_0.06_240)] bg-white/90 px-3 py-1.5 border border-zinc-100">
              <Eye className="h-3 w-3" /> VIEW ARCHIVE
            </div>
          </div>

          {isMOutOfStock && (
            <div className="absolute top-0 left-0 bg-[oklch(0.65_0.1_170)] text-white text-[8px] font-black uppercase italic px-3 py-1.5 tracking-widest">
              SOLD OUT
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1 min-w-0">
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-[oklch(0.65_0.1_170)] italic truncate">
              {product.category || "AUTHENTIC DROP"}
            </p>
            <h3 className="text-[11px] font-black uppercase italic text-[oklch(0.22_0.06_240)] tracking-tighter group-hover:text-[oklch(0.65_0.1_170)] transition-none leading-none truncate">
              {product.name}
            </h3>
          </div>
          <p className="text-[11px] font-black italic text-[oklch(0.22_0.06_240)] tracking-tighter shrink-0">
            ${parseFloat(product.price.toString()).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";