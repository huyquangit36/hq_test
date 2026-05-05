"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/data";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/components/ui/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: "M", // Mặc định kích thước M
      quantity: 1,
    };

    addToCart(cartItem);

    toast({
      title: "Thêm vào giỏ hàng thành công!",
      description: `${product.name} (M) đã được thêm.`,
      duration: 2000,
    });

    setIsAdding(false);
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {product.isNew && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold bg-accent text-accent-foreground rounded">
            NEW
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Nút thêm vào giỏ hàng */}
        <button
          onClick={handleQuickAdd}
          disabled={isAdding}
          className="absolute bottom-4 left-4 right-4 bg-white text-black py-2 px-4 rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 hover:bg-zinc-200 disabled:opacity-50"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>{isAdding ? "Adding..." : "Quick Add"}</span>
        </button>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
