"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loader2, Star, CheckCircle2, Upload, X, Check, PackageOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";



function OrderHistoryContent() {
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

  const searchParams = useSearchParams();
  // Lấy tín hiệu 'payment_success' từ file vnpay-return/route.ts chúng ta đã viết
  const paymentStatus = searchParams.get("status");

  const fetchOrders = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/orders?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      toast.error("SYNC ERROR");
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

      if (paymentStatus === "success") {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cart-updated"));

        toast.success("DROP SECURED", { 
          description: "Payment verified. Your cart has been cleared.",
          style: { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--primary)' }
        });
        window.history.replaceState({}, document.title, "/orders/history");
      }
    } else {
      setLoading(false);
    }
  }, [paymentStatus]);

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
      toast.warning("MISSING FEEDBACK");
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
        toast.success("FEEDBACK LOGGED");
        handleCloseModal();
        fetchOrders(user.id);
      }
    } catch (e) {
      toast.error("ERROR");
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
      <p className="text-[10px] font-black uppercase italic animate-pulse">Syncing Drop History...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-32">
        <div className="mb-16 border-l-4 border-primary pl-6">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
            Drop<br />History<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase mt-4 tracking-[0.4em] italic">Verified HQ Acquisitions</p>
        </div>

        {orders.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-border bg-muted/5">
             <PackageOpen className="h-16 w-16 mx-auto mb-6 text-muted-foreground/30" />
             <p className="text-muted-foreground italic uppercase font-black text-xs tracking-widest">No drops secured yet.</p>
             <Button onClick={() => window.location.href='/products'} className="mt-8 bg-foreground text-background hover:bg-primary transition-all rounded-none px-10 py-6 font-black uppercase italic cursor-pointer shadow-lg">Explore Latest Drops</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((item, index) => (
              <div key={index} className="bg-card border border-border p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex items-center gap-8 w-full md:w-auto">
                  <div className="relative h-28 w-24 bg-muted border border-border overflow-hidden shrink-0">
                    <Image src={item.image_url || "/products/tee-1.jpg"} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest italic mb-2">ID #ORD-{item.order_id}</p>
                    <h3 className="text-xl font-black uppercase italic text-foreground">{item.name}</h3>
                    <div className="flex items-center gap-3 mt-3">
                       <div className={cn("h-2 w-2 rounded-full animate-pulse", item.status === 'Paid' ? "bg-primary" : "bg-orange-500")} />
                       <span className="text-[10px] font-black uppercase tracking-widest italic text-primary">{item.status}</span>
                       <span className="bg-foreground text-background text-[8px] font-black px-2 py-0.5 uppercase italic ml-2">Size {item.size || 'STD'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-12">
                  <p className="font-black text-3xl tracking-tighter text-foreground">${parseFloat(item.price).toFixed(2)}</p>
                  
                  {item.review_id ? (
                    <div className="bg-muted px-8 py-5 flex items-center gap-3 border border-border">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-black uppercase italic text-muted-foreground">LOGGED</span>
                    </div>
                  ) : (
                    (item.status === 'Paid' || item.status === 'Completed') ? (
                      <Button 
                        onClick={() => { setSelectedProduct(item); setShowReviewModal(true); }} 
                        className="bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all rounded-none py-8 px-10 font-black uppercase italic text-xs cursor-pointer shadow-lg"
                      >
                        Rate Drop
                      </Button>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-black uppercase italic opacity-40">Processing...</span>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={handleCloseModal}>
          <div className="bg-background border-2 border-foreground p-10 md:p-14 w-full max-w-xl space-y-10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={handleCloseModal} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"><X size={30} /></button>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-center text-foreground">Post Feedback<span className="text-primary">.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div onClick={triggerFileInput} className="aspect-square w-full bg-muted/30 border border-dashed border-border flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-all group">
                  {previewUrl ? <img src={previewUrl} className="h-full w-full object-cover" /> : <Upload className="text-muted-foreground group-hover:text-primary transition-colors" size={32} />}
                </div>
                <div className="space-y-6">
                    <div className="flex gap-2 text-primary">
                        {[1,2,3,4,5].map(s => <Star key={s} size={24} className={cn("cursor-pointer hover:scale-110 transition-transform", s <= rating ? "fill-current" : "text-muted")} onClick={() => setRating(s)} />)}
                    </div>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="DROP THOUGHTS..." className="w-full bg-muted/30 border p-4 text-xs italic h-40 outline-none focus:border-primary cursor-text text-foreground" />
                </div>
            </div>
            <div className="flex gap-4">
                <Button onClick={handleCloseModal} variant="outline" className="flex-1 rounded-none py-8 cursor-pointer hover:bg-muted text-muted-foreground">Cancel</Button>
                <Button disabled={isSubmitting} onClick={submitReview} className="flex-1 bg-foreground text-background hover:bg-primary py-8 rounded-none font-black italic cursor-pointer shadow-xl">
                   {isSubmitting ? <Loader2 className="animate-spin" /> : "Publish Log"}
                </Button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <OrderHistoryContent />
    </Suspense>
  );
}