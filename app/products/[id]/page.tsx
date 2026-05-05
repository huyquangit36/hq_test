"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { ShoppingBag, ArrowLeft, Loader2, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/components/ui/use-toast";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Lấy ID từ thanh địa chỉ
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // --- GỌI API LẤY DỮ LIỆU THẬT ---
  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setProduct(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  }, [id]);

  // Hàm thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    
    const cartItem = {
      id: product.id.toString(),
      name: product.name,
      price: parseFloat(product.price),
      image: product.image_url || "/products/tee-1.jpg",
      size: selectedSize,
      quantity: quantity,
    };

    addToCart(cartItem);

    toast({
      title: "Thêm vào giỏ hàng thành công!",
      description: `${product.name} (${selectedSize}) x${quantity} đã được thêm.`,
      duration: 3000,
    });

    setIsAddingToCart(false);
    setQuantity(1); // Reset lại số lượng
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Loader2 className="animate-spin h-10 w-10 text-red-600 mb-4" />
        <p className="text-zinc-500 italic text-sm">Authenticating with database...</p>
      </div>
    );
  }

  if (!product) {
    return <div className="p-20 text-center text-white italic bg-black min-h-screen">Sản phẩm không tồn tại.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-24">
        <Link href="/products" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-10 transition-colors uppercase text-xs font-bold tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Back to collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* TRÁI: ẢNH SẢN PHẨM */}
          <div className="relative aspect-square bg-zinc-950 border border-zinc-900 overflow-hidden">
            <Image 
              src={product.image_url || "/products/tee-1.jpg"} 
              alt={product.name} 
              fill 
              className="object-cover hover:scale-110 transition-transform duration-1000" 
            />
          </div>

          {/* PHẢI: THÔNG TIN CHI TIẾT */}
          <div className="flex flex-col justify-center space-y-10">
            <div>
              <span className="text-red-600 font-bold uppercase tracking-[0.4em] text-[10px]">Limited Edition.</span>
              <h1 className="text-6xl font-black uppercase italic tracking-tighter mt-4 leading-none">
                {product.name}
              </h1>
              <p className="text-5xl font-black italic text-red-600 mt-6 tracking-tighter">
                ${parseFloat(product.price).toFixed(2)}
              </p>
            </div>
            
            <div className="space-y-4">
               <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Description</p>
               <p className="text-zinc-400 leading-relaxed italic text-sm max-w-md">
                 {product.description || "Premium streetwear piece crafted for the culture. High quality materials and modern fit."}
               </p>
            </div>

            {/* CHỌN SIZE */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Select Size</p>
              <div className="flex gap-4">
                {["S", "M", "L", "XL"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 border flex items-center justify-center font-black transition-all ${
                      selectedSize === size 
                      ? "border-red-600 bg-red-600 text-white" 
                      : "border-zinc-800 text-zinc-600 hover:border-zinc-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* CHỌN SỐ LƯỢNG */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Quantity</p>
              <div className="flex items-center gap-4 border border-zinc-800 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-zinc-900 transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="px-6 py-3 font-black text-lg min-w-[50px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-zinc-900 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <Button 
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="w-full bg-white text-black hover:bg-zinc-200 py-10 text-xl font-black uppercase italic rounded-none flex gap-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-6 w-6" /> Add to bag
                </>
              )}
            </Button>
            
            <p className="text-[9px] text-zinc-700 uppercase font-bold text-center tracking-[0.3em]">
              Worldwide shipping available. Secure payment.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}