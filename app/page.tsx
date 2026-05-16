"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Instagram, Facebook, Twitter, Globe, Zap, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ChatButton } from "@/components/chat-button";
import { subscribeAction } from "@/app/actions/subscribe";
import { toast } from "sonner";


export default function LandingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async () => {
    if (!email) {
      toast.warning("EMAIL REQUIRED", {
        description: "Please enter your email to join the pack.",
        style: { background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)' }
      });
      return;
    }
    setSubmitting(true);

    const result = await subscribeAction(email);

    if (result.success) {
      toast.success("SUCCESSFULLY SUBSCRIBED", {
        description: "Welcome to HQ. You will receive early access soon.",
        style: { background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--primary)' }
      });
      setEmail("");
    } else {
      toast.error("SUBSCRIPTION FAILED", {
        description: result.error || "An error occurred. Please try again.",
      });
    }
    setSubmitting(false);
  };

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      {/* COMPONENT THÔNG BÁO DẠNG BẢNG */}      
      <Header />

      {/* HERO SECTION - CHUYỂN SANG TÔNG SÁNG */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 bg-muted/30">
        <div className="absolute inset-0 z-0">
          {/* Lớp phủ gradient sáng thay vì đen */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background z-10" />
          <img 
            src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1974&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
            alt="Hero Background"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1 border border-primary bg-primary/10 text-primary text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] italic animate-pulse">
            New Era Collection 2026
          </div>
          
          <h1 className="text-5xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.9] md:leading-[0.85] text-foreground">
            RAW<span className="text-primary">.</span> UNTAMED<br />STREETWEAR
          </h1>
          
          <p className="mt-8 text-muted-foreground text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold max-w-xl mx-auto italic px-4">
            Defining the urban culture through high-end minimalist aesthetics.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 px-6">
            <Link href="/products" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-foreground text-background hover:bg-primary hover:text-white px-12 py-8 text-xs font-black uppercase italic rounded-none transition-all shadow-xl">
                Shop the drop
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/products" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full border-border text-foreground hover:bg-foreground hover:text-background px-12 py-8 text-xs font-black uppercase italic rounded-none">
                Lookbook
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICE SECTION - NỀN MÀU MINT NHẠT (MUTED) */}
      <section className="py-16 md:py-24 border-y border-border bg-muted/50 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <Zap className="h-6 w-6 text-primary mx-auto" />
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest italic text-foreground">Fastest Delivery</h3>
            <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Priority shipping worldwide in 48h.</p>
          </div>
          <div className="space-y-4 border-y md:border-y-0 md:border-x border-border py-8 md:py-0">
            <ShieldCheck className="h-6 w-6 text-primary mx-auto" />
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest italic text-foreground">Secure Payment</h3>
            <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Encrypted transactions via SSL.</p>
          </div>
          <div className="space-y-4">
            <Truck className="h-6 w-6 text-primary mx-auto" />
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest italic text-foreground">Global Returns</h3>
            <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Hassle-free 30-day return policy.</p>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className="py-20 md:py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-l-4 border-primary pl-6 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-foreground">The Essentials.</h2>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mt-2">Curated selection from our latest drop</p>
            </div>
            <Link href="/products" className="text-[10px] font-black uppercase italic border-b-2 border-primary pb-1 hover:text-primary transition-colors text-foreground">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={{
                  ...product,
                  price: parseFloat(product.price),
                  image: product.image_url || "/products/tee-1.jpg"
                }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ABOUT SECTION - SỬ DỤNG MÀU NAVY ĐẬM CHO TEXT TRÊN NỀN SÁNG */}
      <section className="bg-foreground text-background py-20 md:py-32 overflow-hidden px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                Defining <br />the Vibe.
              </h2>
              <p className="text-muted/70 text-sm md:text-base font-medium leading-relaxed italic">
                HQ Streetwear isn't just a brand, it's a movement. We bridge the gap between high-fashion couture and raw urban street style. Every piece is crafted in limited batches, ensuring exclusivity for those who truly lead the pack.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 md:p-6 border border-muted/20">
                  <p className="text-2xl md:text-3xl font-black italic">100%</p>
                  <p className="text-[8px] md:text-[10px] uppercase font-bold text-muted/50">Organic Cotton</p>
                </div>
                <div className="p-4 md:p-6 border border-muted/20">
                  <p className="text-2xl md:text-3xl font-black italic">24/7</p>
                  <p className="text-[8px] md:text-[10px] uppercase font-bold text-muted/50">Culture Support</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-square md:aspect-[4/5] bg-muted/10 order-1 lg:order-2">
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2070&auto=format&fit=crop" 
                className="w-full h-full object-cover grayscale brightness-110"
                alt="Brand Story"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 md:p-10 hidden md:block">
                <p className="text-[10px] md:text-xs font-black uppercase italic tracking-[0.3em]">Est. 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* PORTFOLIO SECTION - FROM B&W TO ORIGINAL COLOR */}
<section className="py-20 md:py-32 bg-muted/20 px-6">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16 md:mb-20">
      <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-foreground">Lookbook Portfolio.</h2>
      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-4 italic">Street Style Photography // Winter 2026</p>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {[
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1976",
        "https://images.unsplash.com/photo-1492288991661-058aa541ff43?q=80&w=1974"
      ].map((img, i) => (
        <div key={i} className="aspect-[3/4] overflow-hidden bg-muted group border border-border">
          <img 
            src={img + "&auto=format&fit=crop"} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
            alt={`Portfolio ${i}`}
          />
        </div>
      ))}
    </div>
  </div>
</section>

      {/* NEWSLETTER SECTION */}
      <section className="py-20 md:py-32 border-t border-border px-6 bg-background">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-foreground">Join the Pack.</h2>
            <p className="text-muted-foreground text-[10px] md:text-sm font-bold uppercase italic tracking-widest px-4">
              Subscribe to get exclusive early access to drops.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch gap-0 border border-border overflow-hidden shadow-2xl">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL ADDRESS" 
                className="flex-1 bg-card px-6 py-5 text-[10px] font-bold tracking-widest outline-none focus:bg-muted/30 transition-colors border-b sm:border-b-0 sm:border-r border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button 
                onClick={handleSubscribe}
                disabled={submitting}
                className="bg-foreground text-background hover:bg-primary hover:text-white rounded-none px-12 py-5 sm:py-0 h-auto text-[10px] font-black uppercase italic transition-all shrink-0"
              >
                {submitting ? "Processing..." : "Subscribe"}
              </Button>
            </div>

            <div className="flex justify-center gap-6 md:gap-8 pt-8">
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Globe className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ChatButton />
    </div>
  );
}