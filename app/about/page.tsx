"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ShieldCheck, Zap, Globe, HardHat, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[oklch(0.22_0.06_240)] font-sans selection:bg-[oklch(0.65_0.1_170)] selection:text-white">
      <Header />

      <main className="pt-24 md:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* 01. HERO SECTION: NEURAL ESTABLISHMENT */}
          <section className="mb-20 md:mb-40">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 md:mb-20">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-3 py-1 border border-[oklch(0.65_0.1_170)] text-[oklch(0.65_0.1_170)] text-[9px] font-black uppercase tracking-[0.3em] italic animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[oklch(0.65_0.1_170)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.65_0.1_170)]"></span>
                  </span>
                  Neural Link Established // 2026.AR
                </div>
                <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black uppercase italic tracking-tighter leading-[0.8] md:leading-[0.75]">
                  THE<br />
                  <span className="text-[oklch(0.65_0.1_170)]">ARCHIVE</span><br />
                  DEF.
                </h1>
              </div>
              <div className="max-w-md border-l-4 border-[oklch(0.22_0.06_240)] pl-6 py-2">
                <p className="text-sm md:text-base font-medium leading-relaxed italic text-zinc-500">
                  HQ Streetwear is not a brand. It is an archive of urban evolution. 
                  We bridge the gap between high-fashion couture and raw street culture, 
                  defining a new era of high-end minimalism.
                </p>
              </div>
            </div>

            {/* FULL WIDTH HERO IMAGE WITH TECHNICAL OVERLAY */}
            <div className="relative aspect-[16/7] w-full overflow-hidden grayscale hover:grayscale-0 transition-none duration-1000 group cursor-crosshair">
              <img 
                src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1974" 
                className="w-full h-full object-cover group-hover:scale-105 transition-none duration-1000"
                alt="HQ Archive Hero"
              />
              <div className="absolute top-6 right-6 text-white text-[10px] font-black uppercase italic tracking-[0.4em] bg-[oklch(0.22_0.06_240)] px-4 py-2">
                Scan Protocol // Active
              </div>
              <div className="absolute bottom-6 left-6 flex items-center gap-4 text-white">
                 <div className="h-px w-20 bg-white hidden md:block" />
                 <span className="text-[10px] font-black uppercase tracking-widest italic">Core Collection 01.</span>
              </div>
            </div>
          </section>

          {/* 02. PHILOSOPHY: HIGH-END MINIMALISM */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-zinc-200 border border-zinc-200 mb-20 md:mb-40">
            <div className="lg:col-span-7 bg-[oklch(0.22_0.06_240)] p-8 md:p-20 text-white flex flex-col justify-between min-h-[400px]">
              <div>
                <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-8 leading-none">
                  Refining<br />The Noise.
                </h2>
                <p className="max-w-lg text-sm md:text-base leading-loose font-medium italic text-zinc-400">
                  Our design language is silent but aggressive. We strip away the unnecessary 
                  to reveal the raw essence of craftsmanship. Every garment is treated 
                  as a technical specification, built for the modern nomad.
                </p>
              </div>
              <div className="mt-12 flex gap-12 border-t border-zinc-800 pt-8">
                <div className="space-y-1">
                  <p className="text-3xl font-black italic text-[oklch(0.65_0.1_170)] tracking-tighter">100%</p>
                  <p className="text-[9px] uppercase font-black tracking-widest text-zinc-500 italic">Organic Fabric</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black italic text-[oklch(0.65_0.1_170)] tracking-tighter">0.0</p>
                  <p className="text-[9px] uppercase font-black tracking-widest text-zinc-500 italic">Waste Tolerance</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 bg-white p-2">
              <div className="relative h-full w-full overflow-hidden group cursor-pointer">
                 <img 
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2070" 
                  className="w-full h-full object-cover grayscale transition-none group-hover:scale-110"
                  alt="Process"
                />
                <div className="absolute inset-0 bg-[oklch(0.65_0.1_170)]/10 opacity-0 group-hover:opacity-100 transition-none" />
              </div>
            </div>
          </section>

          {/* 03. CORE PROTOCOLS (VALUES) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200">
            <ValueCard 
              icon={<Zap className="h-5 w-5" />}
              title="High Velocity"
              desc="Archive design to global uplink within 48 hours. No delays."
            />
            <ValueCard 
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Secure Link"
              desc="HMAC-SHA512 protocol protecting every archive transaction."
            />
            <ValueCard 
              icon={<Globe className="h-5 w-5" />}
              title="Urban Node"
              desc="Connected archives across Tokyo, London, and New York."
            />
            <ValueCard 
              icon={<HardHat className="h-5 w-5" />}
              title="Finishing"
              desc="Hand-finished technical details on every archive piece."
            />
          </section>

          {/* 04. FOOTER CALL TO ACTION */}
<section className="mt-32 mb-20 text-center">
  <h3 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter mb-8">
    Ready to join the Pack?
  </h3>
  
  {/* KẾT NỐI SANG TRANG CONTACT */}
  <Link href="/contact">
    <button className="group relative px-12 py-6 bg-[oklch(0.22_0.06_240)] text-white text-[10px] font-black uppercase italic tracking-[0.5em] hover:bg-[oklch(0.65_0.1_170)] transition-none cursor-pointer rounded-none inline-flex items-center gap-4 overflow-hidden">
      <span className="relative z-10">Initialize Subscription</span>
      <ArrowDownRight className="h-4 w-4 relative z-10 transition-none group-hover:rotate-[-45deg]" />
      
      {/* Hiệu ứng quét khi hover (tùy chọn để tăng độ "high-end") */}
      <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-none duration-500" />
    </button>
  </Link>
  
  <p className="mt-6 text-[9px] font-bold uppercase tracking-widest text-zinc-400 italic">
    Average response time: &lt; 24H // Secure Line
  </p>
</section>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-10 md:p-14 flex flex-col gap-6 hover:bg-[oklch(0.98_0.01_160)] transition-none group cursor-pointer relative overflow-hidden">
      <div className="text-[oklch(0.65_0.1_170)] transition-none group-hover:scale-110 group-hover:-rotate-12 transform origin-left">
        {icon}
      </div>
      <div>
        <h3 className="text-xs font-black uppercase italic tracking-[0.2em] mb-4 text-[oklch(0.22_0.06_240)]">
          {title}
        </h3>
        <p className="text-[10px] font-bold uppercase leading-loose text-zinc-400 group-hover:text-zinc-600 transition-none italic">
          {desc}
        </p>
      </div>
      <ArrowDownRight className="absolute bottom-6 right-6 h-4 w-4 text-zinc-100 group-hover:text-[oklch(0.65_0.1_170)] transition-none" />
    </div>
  );
}