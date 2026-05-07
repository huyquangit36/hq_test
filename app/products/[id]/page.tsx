"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { ShoppingBag, ArrowLeft, Loader2, Star, User, X, MessageSquare, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ChatButton } from "@/components/chat-button";
import Link from "next/link";

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
      
      if (!prodData.error) setProduct(prodData);
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
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItemIndex = currentCart.findIndex((item: any) => item.id === product.id && item.size === selectedSize);
    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity = (currentCart[existingItemIndex].quantity || 1) + 1;
    } else {
      currentCart.push({ id: product.id, name: product.name, price: product.price, image: product.image_url, size: selectedSize, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Vui lòng đăng nhập để đặt câu hỏi!");
    setIsPosting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      body: JSON.stringify({ user_id: user.id, product_id: id, content: newQuestion })
    });
    if (res.ok) {
      setNewQuestion("");
      fetchData();
    }
    setIsPosting(false);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-black"><Loader2 className="animate-spin text-red-600" /></div>;
  if (!product) return <div className="p-20 text-center text-white bg-black min-h-screen uppercase font-black italic">Product not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-24">
        <Link href="/products" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-10 transition-colors uppercase text-xs font-black tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Back to collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="relative aspect-square bg-zinc-950 border border-zinc-900 overflow-hidden">
            <Image 
              src={product.image_url || "/products/tee-1.jpg"} 
              alt={product.name} 
              fill 
              className="object-cover hover:scale-110 transition-transform duration-1000" 
            />
          </div>

          <div className="flex flex-col justify-center space-y-10">
            <div>
              <span className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px] italic">Authentic Drop.</span>
              <h1 className="text-6xl font-black uppercase italic tracking-tighter mt-4 leading-none">{product.name}</h1>
              <p className="text-5xl font-black italic text-red-600 mt-6 tracking-tighter">${parseFloat(product.price).toFixed(2)}</p>
              <p className="text-zinc-500 text-xs uppercase font-bold mt-2 tracking-widest">Color: {product.color || "Standard"}</p>
            </div>
            
            <div className="space-y-4 text-zinc-400 leading-relaxed italic text-sm max-w-md">
              {product.description || "Premium streetwear piece crafted for the culture. High quality materials and modern fit."}
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Select Size</p>
              <div className="flex gap-4">
                {["S", "M", "L", "XL"].map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`w-14 h-14 border flex items-center justify-center font-black transition-all ${selectedSize === size ? "border-red-600 bg-red-600 text-white" : "border-zinc-800 text-zinc-600 hover:border-zinc-400"}`}>{size}</button>
                ))}
              </div>
            </div>

            <Button onClick={addToCart} className="w-full bg-white text-black hover:bg-red-600 hover:text-white py-10 text-xl font-black uppercase italic rounded-none flex gap-4 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <ShoppingBag className="h-6 w-6" /> Add to bag
            </Button>
          </div>
        </div>

        <div className="mt-16 md:mt-32 border-t border-zinc-900 pt-20">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">Community Feedback<span className="text-red-600">.</span></h2>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-2">Verified purchase reviews from the pack</p>
            </div>
            <div className="text-right hidden md:block">
               <p className="text-sm font-black italic">{reviews.length} Feedbacks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-zinc-950 border border-zinc-900 p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-zinc-800 flex items-center justify-center rounded-full uppercase font-black text-xs italic text-red-600">{rev.full_name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-black uppercase italic text-white">{rev.full_name}</p>
                      <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Verified Member</p>
                    </div>
                  </div>
                  <div className="flex text-red-600">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < rev.rating ? "fill-current" : "text-zinc-900"}`} />)}
                  </div>
                </div>
                
                {rev.image_url && (
                  <div onClick={() => setSelectedImage(rev.image_url)} className="relative h-48 w-full bg-zinc-900 border border-zinc-800 overflow-hidden cursor-zoom-in group">
                    <img src={rev.image_url} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" alt="Review" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-black uppercase italic">Click to expand</div>
                  </div>
                )}

                <p className="text-zinc-400 text-sm italic leading-relaxed pl-2 border-l-2 border-red-600">"{rev.comment}"</p>
                <p className="text-[8px] text-zinc-800 font-black uppercase tracking-[0.3em] text-right">{new Date(rev.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>

          {reviews.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-zinc-900 mb-20">
              <p className="text-zinc-600 italic uppercase text-xs font-bold tracking-widest">No feedbacks yet.</p>
            </div>
          )}
        </div>

        <div className="mt-16 md:mt-32 border-t border-zinc-900 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-4 space-y-8">
               <h2 className="text-4xl font-black uppercase italic tracking-tighter">Inquiry Hub<span className="text-red-600">.</span></h2>
               <p className="text-zinc-500 text-xs font-bold uppercase italic tracking-widest leading-relaxed">Have a question about fit or material? Ask the pack directly.</p>
               
               <form onSubmit={handlePostQuestion} className="space-y-4 bg-zinc-950 p-2 md:p-6 border border-zinc-900">
                  <textarea value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="WHAT'S ON YOUR MIND?" className="w-full bg-black border border-zinc-800 p-4 text-xs font-bold text-white italic outline-none focus:border-red-600 h-32 resize-none" required />
                  <Button disabled={isPosting} type="submit" className="w-full bg-red-600 text-white rounded-none font-black uppercase italic py-6 hover:bg-red-700 transition-all">
                    {isPosting ? <Loader2 className="animate-spin h-4 w-4" /> : "Post Inquiry"}
                  </Button>
               </form>
            </div>

            <div className="lg:col-span-8 space-y-12">
               <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] italic border-b border-zinc-900 pb-4">{questions.length} Conversations</p>
               <div className="space-y-12">
                  {questions.map((q) => (
                    <div key={q.id} className="space-y-4">
                       <div className="flex items-start gap-4">
                          <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-red-600 text-xs italic">{q.full_name.charAt(0)}</div>
                          <div className="flex-1">
                             <div className="flex items-center gap-4 mb-1">
                                <p className="text-sm font-black uppercase italic text-white">{q.full_name}</p>
                                <span className="text-[8px] text-zinc-700 font-bold uppercase">{new Date(q.created_at).toLocaleDateString()}</span>
                             </div>
                             <p className="text-zinc-400 text-sm italic leading-relaxed">"{q.content}"</p>
                          </div>
                       </div>
                       {/* THUẬT TOÁN: Hiển thị phản hồi thật từ Database */}
                       {q.is_answered && (
                         <div className="ml-14 bg-zinc-900/30 border-l-2 border-red-600 p-6 space-y-2 animate-in slide-in-from-left-2">
                            <div className="flex items-center gap-2">
                               <UserCheck size={12} className="text-red-600" />
                               <p className="text-[10px] font-black uppercase text-white tracking-widest">HQ Official Response</p>
                            </div>
                            <p className="text-sm text-white italic font-bold">"{q.reply_content}"</p>
                         </div>
                       )}
                    </div>
                  ))}
                  {questions.length === 0 && (
                    <div className="py-20 text-center border border-zinc-900 border-dashed">
                       <p className="text-zinc-700 font-black uppercase italic text-sm tracking-widest">No inquiries yet. Start the conversation.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* OVERLAY XEM ẢNH TO */}
      {selectedImage && (
        <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-10 right-10 text-white hover:text-red-600 transition-colors"><X className="h-10 w-10" /></button>
          <img src={selectedImage} className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-300" alt="Full View" />
        </div>
      )}

      <Footer />
      <ChatButton />
    </div>
  );
}