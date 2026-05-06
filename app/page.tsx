"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Instagram, Facebook, Twitter, Globe, Zap, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ChatButton } from "@/components/chat-button";

export default function LandingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      <Header />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black z-10" />
          <img 
            src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1974&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
            alt="Hero Background"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1 border border-red-600 bg-red-600/10 text-red-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] italic animate-pulse">
            New Era Collection 2026
          </div>
          
          <h1 className="text-5xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.9] md:leading-[0.85]">
            RAW<span className="text-red-600">.</span> UNTAMED<br />STREETWEAR
          </h1>
          
          <p className="mt-8 text-zinc-400 text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold max-w-xl mx-auto italic px-4">
            Defining the urban culture through high-end minimalist aesthetics.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 px-6">
            <Link href="/products" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-white text-black hover:bg-red-600 hover:text-white px-12 py-8 text-xs font-black uppercase italic rounded-none transition-all">
                Shop the drop
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/products" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full border-zinc-800 text-white hover:bg-white hover:text-black px-12 py-8 text-xs font-black uppercase italic rounded-none">
                Lookbook
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICE SECTION */}
      <section className="py-16 md:py-24 border-y border-zinc-900 bg-zinc-950 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <Zap className="h-6 w-6 text-red-600 mx-auto" />
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest italic">Fastest Delivery</h3>
            <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Priority shipping worldwide in 48h.</p>
          </div>
          <div className="space-y-4 border-y md:border-y-0 md:border-x border-zinc-900 py-8 md:py-0">
            <ShieldCheck className="h-6 w-6 text-red-600 mx-auto" />
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest italic">Secure Payment</h3>
            <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Encrypted transactions via SSL.</p>
          </div>
          <div className="space-y-4">
            <Truck className="h-6 w-6 text-red-600 mx-auto" />
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest italic">Global Returns</h3>
            <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Hassle-free 30-day return policy.</p>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-l-4 border-red-600 pl-6 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-balance">The Essentials.</h2>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-2">Curated selection from our latest drop</p>
            </div>
            <Link href="/products" className="text-[10px] font-black uppercase italic border-b-2 border-red-600 pb-1 hover:text-red-600 transition-colors">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-red-600" /></div>
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

      {/* ABOUT SECTION */}
      <section className="bg-white text-black py-20 md:py-32 overflow-hidden px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                Defining <br />the Vibe.
              </h2>
              <p className="text-zinc-600 text-sm md:text-base font-medium leading-relaxed italic">
                HQ Streetwear isn't just a brand, it's a movement. We bridge the gap between high-fashion couture and raw urban street style. Every piece is crafted in limited batches, ensuring exclusivity for those who truly lead the pack.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 md:p-6 border border-zinc-200">
                  <p className="text-2xl md:text-3xl font-black italic">100%</p>
                  <p className="text-[8px] md:text-[10px] uppercase font-bold text-zinc-500">Organic Cotton</p>
                </div>
                <div className="p-4 md:p-6 border border-zinc-200">
                  <p className="text-2xl md:text-3xl font-black italic">24/7</p>
                  <p className="text-[8px] md:text-[10px] uppercase font-bold text-zinc-500">Culture Support</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-square md:aspect-[4/5] bg-zinc-100 order-1 lg:order-2">
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2070&auto=format&fit=crop" 
                className="w-full h-full object-cover grayscale"
                alt="Brand Story"
              />
              <div className="absolute -bottom-6 -left-6 bg-black text-white p-6 md:p-10 hidden md:block">
                <p className="text-[10px] md:text-xs font-black uppercase italic tracking-[0.3em]">Est. 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO SECTION */}
      <section className="py-20 md:py-32 bg-zinc-950 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Lookbook Portfolio.</h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-4 italic">Street Style Photography // Winter 2026</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070",
              "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040",
              "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1976",
              "https://images.unsplash.com/photo-1492288991661-058aa541ff43?q=80&w=1974"
            ].map((img, i) => (
              <div key={i} className="aspect-[3/4] overflow-hidden bg-zinc-900 group relative">
                <img 
                  src={img + "&auto=format&fit=crop"} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                  alt={`Portfolio ${i}`}
                />
                <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER SECTION */}
      <section className="py-20 md:py-32 border-t border-zinc-900 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">Join the Pack.</h2>
            <p className="text-zinc-500 text-[10px] md:text-sm font-bold uppercase italic tracking-widest px-4">Subscribe to get exclusive early access to drops.</p>
            <div className="flex flex-col sm:flex-row items-stretch gap-0 border border-zinc-800 overflow-hidden">
              <input 
                type="email" 
                placeholder="YOUR EMAIL ADDRESS" 
                className="flex-1 bg-zinc-900 px-6 py-5 text-[10px] font-bold uppercase tracking-widest outline-none focus:bg-zinc-800 transition-colors border-b sm:border-b-0 sm:border-r border-zinc-800"
              />
              <Button className="bg-white text-black hover:bg-red-600 hover:text-white rounded-none px-12 py-5 sm:py-0 h-auto text-[10px] font-black uppercase italic transition-all shrink-0">
                Subscribe
              </Button>
            </div>
            <div className="flex justify-center gap-6 md:gap-8 pt-8">
              <Instagram className="h-5 w-5 text-zinc-500 hover:text-red-600 cursor-pointer transition-colors" />
              <Facebook className="h-5 w-5 text-zinc-500 hover:text-red-600 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-zinc-500 hover:text-red-600 cursor-pointer transition-colors" />
              <Globe className="h-5 w-5 text-zinc-500 hover:text-red-600 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ChatButton />
    </div>
  );
}