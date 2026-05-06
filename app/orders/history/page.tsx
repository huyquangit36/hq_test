"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loader2, Star, CheckCircle2, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
    const res = await fetch(`/api/user/orders?userId=${userId}`);
    const data = await res.json();
    if (Array.isArray(data)) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchOrders(userData.id);
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
    if (!comment) return alert("Vui lòng nhập nhận xét!");
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
        alert("Cảm ơn bạn đã đánh giá!");
        handleCloseModal();
        fetchOrders(user.id);
      }
    } catch (e) {
      alert("Lỗi khi gửi đánh giá");
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-12">Purchase History<span className="text-red-600">.</span></h1>
        <div className="space-y-6">
          {orders.map((item, index) => (
            <div key={index} className="bg-zinc-950 border border-zinc-900 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="relative h-20 w-20 bg-zinc-900 border border-zinc-800 overflow-hidden">
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-2">Order #ORD-{item.order_id}</p>
                  <h3 className="text-lg font-black uppercase italic">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-3">
                     <CheckCircle2 className="h-3 w-3 text-green-500" />
                     <span className="text-[9px] font-black uppercase text-green-500">{item.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-black text-xl mr-6">${parseFloat(item.price).toFixed(2)}</p>
                {item.review_id ? (
                  <Button disabled className="bg-zinc-900 text-zinc-600 border border-zinc-800 rounded-none uppercase font-black italic px-8 py-6 flex gap-2">
                    <Check className="h-4 w-4" /> Review Posted
                  </Button>
                ) : (
                  (item.status === 'Paid' || item.status === 'Completed') ? (
                    <Button onClick={() => { setSelectedProduct(item); setShowReviewModal(true); }} className="bg-red-600 hover:bg-red-700 text-white rounded-none uppercase font-black italic px-8 py-6">Rate Drop</Button>
                  ) : (
                    <span className="text-[10px] text-zinc-700 font-black uppercase italic">Locked</span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {showReviewModal && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-zinc-900 p-8 w-full max-w-md space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase italic">Post Review.</h2>
              <button onClick={handleCloseModal}><X className="text-zinc-500 hover:text-white" /></button>
            </div>
            <div className="space-y-4 text-center">
              <p className="text-[10px] font-black uppercase text-zinc-500">Visual Feedback</p>
              <div onClick={triggerFileInput} className="h-32 w-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden cursor-pointer hover:border-red-600 transition-colors">
                {previewUrl ? <img src={previewUrl} className="h-full object-contain" alt="Preview" /> : <Upload className="text-zinc-700" />}
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
            <div className="flex gap-3 text-yellow-500 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-8 w-8 cursor-pointer ${s <= rating ? "fill-current" : "text-zinc-900"}`} onClick={() => setRating(s)} />
              ))}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="DROP YOUR THOUGHTS..." className="w-full bg-black border border-zinc-900 p-4 text-sm text-white italic outline-none focus:border-red-600 h-32 resize-none" />
            <div className="flex gap-4">
              <Button onClick={handleCloseModal} variant="outline" className="flex-1 rounded-none border-zinc-800 text-zinc-500 uppercase font-black italic">Cancel</Button>
              <Button disabled={isSubmitting} onClick={submitReview} className="flex-1 bg-white text-black hover:bg-red-600 hover:text-white rounded-none uppercase font-black italic">{isSubmitting ? <Loader2 className="animate-spin" /> : "Post Drop"}</Button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}