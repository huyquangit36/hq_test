"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";

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

    const quantityInCart = existingItemIndex > -1 ? currentCart[existingItemIndex].quantity : 0;

    // Kiểm tra kho của Size M
    if (quantityInCart + 1 > stockM) {
      toast.error("OUT OF STOCK", {
        description: `Size M of this product is currently out of stock.`,
        style: { background: '#000', color: '#fff', border: '1px solid #27272a' }
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
        stock: stockM // Lưu stock Size M để trang checkout dùng
      });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cart-updated"));
  
    toast.success("ADDED TO BAG.", {
      description: `${product.name} (Size M) it has been added.`,
      style: { background: '#000', color: '#fff', border: '1px solid #27272a' }
    });
  };

  const isMOutOfStock = (product.size_stocks?.M || 0) <= 0;

  return (
    <div className="group relative bg-black border border-zinc-900 overflow-hidden transition-all duration-500 hover:border-zinc-700">
      <Toaster position="top-center" theme="dark" />
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-950">
          <Image
            src={product.image || "/products/tee-1.jpg"}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-110 ${isMOutOfStock ? 'grayscale opacity-50' : ''}`}
          />
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
            <Button 
              onClick={addToCart}
              disabled={isMOutOfStock}
              className={`w-40 rounded-none font-black uppercase italic text-xs py-6 transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 ${
                isMOutOfStock 
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                : "bg-white text-black hover:bg-red-600 hover:text-white"
              }`}
            >
              {isMOutOfStock ? (
                "Sold Out (M)"
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-4 w-4" /> Quick Add
                </>
              )}
            </Button>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white transform translate-y-4 group-hover:translate-y-0 duration-700 delay-75">
              <Eye className="h-3 w-3" /> View Details
            </div>
          </div>

          {isMOutOfStock && (
            <div className="absolute top-4 left-4">
               <span className="bg-red-600 text-white text-[8px] font-black uppercase italic px-2 py-1">Size M Out</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">{product.category || "Streetwear"}</p>
            <h3 className="text-sm font-black uppercase italic text-white tracking-tighter group-hover:text-red-600 transition-colors">
              {product.name}
            </h3>
          </div>
          <p className="text-sm font-black italic text-white">
            ${parseFloat(product.price.toString()).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}