"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loader2, Star, CheckCircle2, Upload, X, Check, PackageOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import { cn } from "@/lib/utils";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOrders = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/orders?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      toast.error("SYNC ERROR", { description: "Failed to fetch your drop history." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchOrders(userData.id);
    } else {
      setLoading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const submitReview = async () => {
    if (!comment) {
      toast.warning("MISSING FEEDBACK", { description: "Please drop a few words about the quality." });
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("product_id", selectedProduct.product_id);
    formData.append("rating", rating.toString());
    formData.append("comment", comment);
    if (selectedFile) formData.append("image", selectedFile);

    try {
      const res = await fetch("/api/reviews", { method: "POST", body: formData });
      if (res.ok) {
        toast.success("FEEDBACK RECEIVED", { description: "Thanks for supporting the collective." });
        handleCloseModal();
        fetchOrders(user.id);
      }
    } catch (e) {
      toast.error("TRANSMISSION ERROR");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setComment("");
    setRating(5);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary h-12 w-12" />
      <p className="text-[10px] font-black uppercase italic tracking-[0.5em] text-muted-foreground animate-pulse">Accessing Archives...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Toaster position="top-center" theme="light" />
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-32">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
            Purchase<br />History<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase mt-4 tracking-[0.4em] italic">Your Verified HQ Acquisitions</p>
        </div>

        {orders.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-border bg-muted/5">
             <PackageOpen className="h-16 w-16 mx-auto mb-6 text-muted-foreground/30" />
             <p className="text-muted-foreground italic uppercase font-black text-xs tracking-widest">No drops secured yet.</p>
             <Button onClick={() => window.location.href='/products'} className="mt-8 bg-foreground text-background hover:bg-primary transition-all rounded-none px-10 py-6 font-black uppercase italic cursor-pointer">Shop Latest Drops</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((item, index) => (
              <div key={index} className="bg-card border border-border p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-8 w-full md:w-auto">
                  <div className="relative h-28 w-24 bg-muted border border-border overflow-hidden flex-shrink-0">
                    <Image src={item.image_url || "/products/tee-1.jpg"} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest italic mb-2">Registry #ORD-{item.order_id}</p>
                    <h3 className="text-xl font-black uppercase italic text-foreground leading-none">{item.name}</h3>
                    <div className="flex items-center gap-2 pt-2">
                       <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                       <span className="text-[10px] font-black uppercase text-primary tracking-widest italic">{item.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-10">
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Acquisition Price</p>
                    <p className="font-black text-3xl tracking-tighter">${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  
                  {item.review_id ? (
                    <div className="bg-muted px-8 py-5 flex items-center gap-3 border border-border">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-black uppercase italic text-muted-foreground">FEEDBACK LOGGED</span>
                    </div>
                  ) : (
                    (item.status === 'Paid' || item.status === 'Completed') ? (
                      <Button 
                        onClick={() => { setSelectedProduct(item); setShowReviewModal(true); }} 
                        className="bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all rounded-none py-8 px-10 font-black uppercase italic text-xs cursor-pointer shadow-lg active:scale-95"
                      >
                        Rate Drop
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 opacity-30 grayscale">
                        <X size={12} />
                        <span className="text-[10px] font-black uppercase italic tracking-widest">Awaiting Logistics</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* REVIEW MODAL - LIGHT INDUSTRIAL THEME */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-background border-2 border-foreground p-10 md:p-14 w-full max-w-xl space-y-10 shadow-2xl relative">
            <button onClick={handleCloseModal} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"><X size={30} /></button>
            
            <div className="text-center">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-4">Post Feedback<span className="text-primary">.</span></h2>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em] italic">Verification Sequence 77-B</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Image Upload Area */}
              <div className="space-y-4">
                <p className="text-[9px] font-black uppercase text-foreground italic tracking-widest pl-1">Visual Log</p>
                <div 
                  onClick={triggerFileInput} 
                  className="aspect-square w-full bg-muted/30 border border-dashed border-border flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-all group relative"
                >
                  {previewUrl ? (
                    <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <Upload className="text-muted-foreground group-hover:text-primary mb-3 transition-colors" size={32} />
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Attach Media</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>

              {/* Rating & Text Area */}
              <div className="flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[9px] font-black uppercase text-foreground italic tracking-widest">Stellar Rating</p>
                    <div className="flex gap-2 text-primary">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          size={24}
                          className={cn("cursor-pointer transition-all hover:scale-125", s <= rating ? "fill-current" : "text-muted border-none")} 
                          onClick={() => setRating(s)} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[9px] font-black uppercase text-foreground italic tracking-widest">Written Context</p>
                    <textarea 
                      value={comment} 
                      onChange={(e) => setComment(e.target.value)} 
                      placeholder="DROP YOUR THOUGHTS ON THE FIT..." 
                      className="w-full bg-muted/30 border border-border p-4 text-xs text-foreground font-medium italic outline-none focus:border-primary h-40 resize-none cursor-text" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button onClick={handleCloseModal} variant="outline" className="flex-1 rounded-none border-border text-muted-foreground uppercase font-black italic py-8 cursor-pointer hover:bg-muted/50">Cancel</Button>
              <Button 
                disabled={isSubmitting} 
                onClick={submitReview} 
                className="flex-1 bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all rounded-none py-8 font-black uppercase italic shadow-xl cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2">Publish Log <ArrowRight size={16}/></span>}
              </Button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}