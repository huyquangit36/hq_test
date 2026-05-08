"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { ShoppingBag, ArrowLeft, Loader2, Star, User, X, MessageSquare, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ChatButton } from "@/components/chat-button";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  

  const ALL_SIZES = ["S", "M", "L", "XL"];

  const fetchData = async () => {
    try {
      const [prodRes, revRes, quesRes] = await Promise.all([
        fetch(`/api/products/${id}`),
        fetch(`/api/products/${id}/reviews`),
        fetch(`/api/comments?productId=${id}`)
      ]);
      const prodData = await prodRes.json();
      const revData = await revRes.json();
      const quesData = await quesRes.json();
      
      if (!prodData.error) {
        setProduct(prodData);
        // Tự động chọn size đầu tiên còn hàng
        const firstAvailableSize = ALL_SIZES.find(s => (prodData.size_stocks?.[s] || 0) > 0);
        if (firstAvailableSize) setSelectedSize(firstAvailableSize);
      }
      if (Array.isArray(revData)) setReviews(revData);
      if (Array.isArray(quesData)) setQuestions(quesData);
      
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchData();
  }, [id]);
  

  const addToCart = () => {
    if (!product) return;

    if (!user) {
    toast.error("SESSION EXPIRED OR MISSING", {
      description: "Please authorize your account to add items to your drop.",
      style: { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--primary)' }
    });
    return;
  }

    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const stockForSelectedSize = product.size_stocks?.[selectedSize] || 0;
    const existingItemIndex = currentCart.findIndex(
      (item: any) => item.id === product.id && item.size === selectedSize
    );
    const quantityInCart = existingItemIndex > -1 ? currentCart[existingItemIndex].quantity : 0;

    if (quantityInCart + 1 > stockForSelectedSize) {
      toast.error("OUT OF STOCK", {
        description: `Size ${selectedSize} currently has only ${stockForSelectedSize} items available.`,
        style: { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--destructive)' }
      });
      return;
    }

    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({ 
        id: product.id, name: product.name, price: product.price, 
        image: product.image_url, size: selectedSize, quantity: 1, stock: stockForSelectedSize 
      });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cart-updated"));

    toast.success("ADDED TO BAG", {
      description: `${product.name} - Size ${selectedSize} is ready for checkout.`,
      style: { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--primary)' }
    });
  };

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("LOGIN REQUIRED", { description: "Please log in to ask a question." });
      return;
    }
    setIsPosting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      body: JSON.stringify({ user_id: user.id, product_id: id, content: newQuestion })
    });
    if (res.ok) {
      setNewQuestion("");
      fetchData();
      toast.success("QUESTION POSTED", { description: "Your inquiry has been sent to the HQ team." });
    }
    setIsPosting(false);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-background"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;
  if (!product) return <div className="p-20 text-center text-foreground bg-background min-h-screen uppercase font-black italic">Product not found.</div>;

  const isOutOfStock = !ALL_SIZES.some(s => (product.size_stocks?.[s] || 0) > 0);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Toaster position="top-center" theme="light" closeButton />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-24">
        <Link href="/products" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-10 transition-colors uppercase text-[10px] font-black tracking-widest cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back to collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* PRODUCT IMAGE */}
          <div className="relative aspect-square bg-muted border border-border overflow-hidden group">
            <Image 
              src={product.image_url || "/products/tee-1.jpg"} 
              alt={product.name} 
              fill 
              className="object-cover transition-transform duration-1000 group-hover:scale-105" 
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[2px]">
                <span className="border-2 border-foreground px-8 py-4 text-foreground font-black italic uppercase text-3xl tracking-tighter">Sold Out</span>
              </div>
            )}
          </div>

          {/* PRODUCT INFO */}
          <div className="flex flex-col justify-center space-y-10">
            <div>
              <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] italic">Authentic Drop.</span>
              <h1 className="text-6xl font-black uppercase italic tracking-tighter mt-4 leading-none text-foreground">{product.name}</h1>
              <p className="text-5xl font-black italic text-foreground mt-6 tracking-tighter">${parseFloat(product.price).toFixed(2)}</p>
              
              <div className="flex items-center gap-4 mt-6 text-[10px] font-black uppercase tracking-widest italic border-l-2 border-primary pl-4">
                 <p className="text-muted-foreground">Color: {product.color || "Standard"}</p>
                 <span className="h-1 w-1 rounded-full bg-border" />
                 <p className={product.size_stocks?.[selectedSize] > 0 ? "text-primary" : "text-destructive"}>
                   {selectedSize}: {product.size_stocks?.[selectedSize] || 0} units left
                 </p>
              </div>
            </div>
            
            <p className="text-muted-foreground leading-relaxed italic text-sm max-w-md">
              {product.description || "Premium streetwear piece crafted for the culture. High quality materials and modern fit."}
            </p>

            {/* SIZE SELECTOR */}
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Size</p>
              <div className="flex gap-4">
                {ALL_SIZES.map((size) => {
                  const sizeStock = product.size_stocks?.[size] || 0;
                  return (
                    <button 
                      key={size} 
                      onClick={() => setSelectedSize(size)} 
                      disabled={sizeStock <= 0}
                      className={cn(
                        "w-14 h-14 border flex flex-col items-center justify-center font-black transition-all relative cursor-pointer",
                        selectedSize === size 
                          ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                          : sizeStock > 0 
                            ? "border-border text-muted-foreground hover:border-primary hover:text-primary"
                            : "border-muted bg-muted/50 text-muted-foreground/30 cursor-not-allowed"
                      )}
                    >
                      <span className="text-xs">{size}</span>
                      {sizeStock <= 5 && sizeStock > 0 && (
                        <span className="absolute -top-1 -right-1 bg-foreground text-background text-[7px] px-1 font-bold">LOW</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ADD TO BAG BUTTON */}
            <Button 
              onClick={addToCart} 
              disabled={isOutOfStock || (product.size_stocks?.[selectedSize] || 0) <= 0}
              className={cn(
                "w-full py-10 text-xl font-black uppercase italic rounded-none flex gap-4 transition-all active:scale-95 cursor-pointer",
                isOutOfStock || (product.size_stocks?.[selectedSize] || 0) <= 0
                ? "bg-muted text-muted-foreground cursor-not-allowed border border-border" 
                : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground shadow-xl"
              )}
            >
              {(product.size_stocks?.[selectedSize] || 0) > 0 ? (
                <>
                  <ShoppingBag className="h-6 w-6" /> Add to bag
                </>
              ) : (
                "Out of Stock"
              )}
            </Button>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="mt-32 border-t border-border pt-20">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">Community Feedback<span className="text-primary">.</span></h2>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mt-2 italic">Verified purchase reviews from the pack</p>
            </div>
            <p className="text-sm font-black italic text-foreground hidden md:block">{reviews.length} Feedbacks</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-card border border-border p-8 space-y-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted border border-border flex items-center justify-center font-black text-xs italic text-primary">{rev.full_name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-black uppercase italic text-foreground">{rev.full_name}</p>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Verified Member</p>
                    </div>
                  </div>
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < rev.rating ? "fill-current" : "text-muted"} />)}
                  </div>
                </div>
                <p className="text-foreground text-sm italic leading-relaxed pl-4 border-l-2 border-primary">"{rev.comment}"</p>
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.3em] text-right">{new Date(rev.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          {reviews.length === 0 && (
            <div className="py-20 text-center border border-dashed border-border bg-muted/5">
              <p className="text-muted-foreground italic uppercase text-xs font-bold tracking-widest">No feedbacks yet.</p>
            </div>
          )}
        </div>

        {/* INQUIRY HUB */}
        <div className="mt-32 border-t border-border pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-4 space-y-8">
               <h2 className="text-4xl font-black uppercase italic tracking-tighter">Inquiry Hub<span className="text-primary">.</span></h2>
               <p className="text-muted-foreground text-xs font-bold uppercase italic tracking-widest leading-relaxed">Ask the pack about fit or material.</p>
               <form onSubmit={handlePostQuestion} className="space-y-4 bg-muted/30 p-6 border border-border">
                  <textarea 
                    value={newQuestion} 
                    onChange={(e) => setNewQuestion(e.target.value)} 
                    placeholder="WHAT'S ON YOUR MIND?" 
                    className="w-full bg-background border border-border p-4 text-xs font-bold text-foreground italic outline-none focus:border-primary h-32 resize-none cursor-text" 
                    required 
                  />
                  <Button disabled={isPosting} type="submit" className="w-full bg-primary text-primary-foreground rounded-none font-black uppercase italic py-7 hover:bg-foreground hover:text-background transition-all cursor-pointer">
                    {isPosting ? <Loader2 className="animate-spin h-4 w-4" /> : "Post Inquiry"}
                  </Button>
               </form>
            </div>

            <div className="lg:col-span-8 space-y-12">
               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] italic border-b border-border pb-4">{questions.length} Conversations</p>
               <div className="space-y-12">
                  {questions.map((q) => (
                    <div key={q.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                       <div className="flex items-start gap-4">
                          <div className="h-10 w-10 bg-background border border-border flex items-center justify-center font-black text-primary text-xs italic">{q.full_name.charAt(0)}</div>
                          <div className="flex-1">
                             <div className="flex items-center gap-4 mb-2">
                                <p className="text-sm font-black uppercase italic text-foreground">{q.full_name}</p>
                                <span className="text-[8px] text-muted-foreground font-bold uppercase">{new Date(q.created_at).toLocaleDateString()}</span>
                             </div>
                             <p className="text-muted-foreground text-sm italic leading-relaxed">"{q.content}"</p>
                          </div>
                       </div>
                       {q.is_answered && (
                         <div className="ml-14 bg-muted/50 border-l-2 border-primary p-6 space-y-2">
                            <div className="flex items-center gap-2">
                               <UserCheck size={12} className="text-primary" />
                               <p className="text-[10px] font-black uppercase text-foreground tracking-widest">HQ Official Response</p>
                            </div>
                            <p className="text-sm text-foreground italic font-bold">"{q.reply_content}"</p>
                         </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* LIGHTBOX FOR IMAGES */}
      {selectedImage && (
        <div className="fixed inset-0 z-[1000] bg-white/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-10 right-10 text-foreground hover:text-primary transition-colors cursor-pointer"><X size={40} /></button>
          <img src={selectedImage} className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-300 border border-border" alt="View" />
        </div>
      )}

      <Footer />
      <ChatButton />
    </div>
  );
}