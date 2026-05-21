import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ChatButton } from "@/components/chat-button";
import { NewsletterSection } from "@/components/newsletter-section";
import { query } from "@/lib/db";
import { unstable_cache } from "next/cache";

const getFeaturedProducts = unstable_cache(
  async () => {
    const res = await query(`
      SELECT id, name, price, image_url, category, size_stocks 
      FROM products 
      ORDER BY id DESC 
      LIMIT 4
    `);
    return res.rows;
  },
  ['featured-products-home'],
  { revalidate: 60, tags: ['products'] }
);

export default async function LandingPage() {
  const products = await getFeaturedProducts();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      <Header />

      {/* HERO SECTION - GIỮ NGUYÊN LAYOUT SÁNG */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 bg-muted/30">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background z-10" />
          <Image
            src="/images/hero-bg.png"
            alt="Hero Background"
            fill
            priority
            className="object-cover opacity-40 grayscale transition-none"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1 border border-primary bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.5em] italic animate-pulse">
            New Era Collection 2026
          </div>

          <h1 className="text-5xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.9] md:leading-[0.85] text-foreground">
            RAW<span className="text-primary">.</span> UNTAMED<br />STREETWEAR
          </h1>

          <p className="mt-8 text-muted-foreground text-[10px] md:text-sm uppercase tracking-[0.3em] font-bold max-w-xl mx-auto italic px-4">
            Defining the urban culture through high-end minimalist aesthetics.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 px-6">
            <Link href="/products" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-foreground text-background hover:bg-primary hover:text-white px-12 py-8 text-xs font-black uppercase italic rounded-none transition-none shadow-xl">
                Shop the drop
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/products" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full border-border text-foreground hover:bg-foreground hover:text-background px-12 py-8 text-xs font-black uppercase italic rounded-none transition-none">
                Lookbook
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICE SECTION - GIỮ NGUYÊN MINT MUDED */}
      <section className="py-16 md:py-24 border-y border-border bg-muted/50 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <ServiceItem icon={<Zap />} title="Fastest Delivery" desc="Priority shipping worldwide in 48h." />
          <ServiceItem icon={<ShieldCheck />} title="Secure Payment" desc="Encrypted transactions via SSL." className="border-y md:border-y-0 md:border-x" />
          <ServiceItem icon={<Truck />} title="Global Returns" desc="Hassle-free 30-day return policy." />
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
            <Link href="/products" className="text-[10px] font-black uppercase italic border-b-2 border-primary pb-1 hover:text-primary transition-none text-foreground">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product: any, index: number) => (
              <ProductCard
                key={product.id}
                priority={index < 4}
                product={{
                  ...product,
                  price: parseFloat(product.price),
                  image: product.image_url
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION - GIỮ NGUYÊN NAVY/MINT */}
      <section className="bg-foreground text-background py-20 md:py-32 overflow-hidden px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                Defining <br />the Vibe.
              </h2>
              <p className="text-muted/70 text-sm md:text-base font-medium leading-relaxed italic">
                HQ Streetwear isn't just a brand, it's a movement. We bridge the gap between high-fashion couture and raw urban street style.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <MetricBox value="100%" label="Organic Cotton" />
                <MetricBox value="24/7" label="Culture Support" />
              </div>
            </div>
            <div className="relative aspect-square md:aspect-[4/5] bg-muted/10 order-1 lg:order-2">
              <Image
                src="/images/brand-story.png"
                alt="Brand Story"
                fill
                className="object-cover grayscale brightness-110"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 md:p-10 hidden md:block">
                <p className="text-[10px] md:text-xs font-black uppercase italic tracking-[0.3em]">Est. 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO SECTION */}
      <section className="py-20 md:py-32 bg-muted/20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-foreground">Lookbook Portfolio.</h2>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-4 italic">Street Style Photography // Winter 2026</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              "/images/portfolio-1.png",
              "/images/portfolio-2.png",
              "/images/portfolio-3.png",
              "/images/portfolio-4.png"
            ].map((img, i) => (
              <div key={i} className="aspect-[3/4] relative overflow-hidden bg-muted group border border-border">
                <Image
                  src={img}
                  alt={`Portfolio ${i}`}
                  fill
                  sizes="(max-w-768px) 50vw, 25vw"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER SECTION - GIỮ NGUYÊN LAYOUT */}
      <section className="py-20 md:py-32 border-t border-border px-6 bg-background">
        <div className="max-w-7xl mx-auto text-center">
          <NewsletterSection />
        </div>
      </section>

      <Footer />
      <ChatButton />
    </div>
  );
}

function ServiceItem({ icon, title, desc, className }: any) {
  return (
    <div className={`space-y-4 py-8 md:py-0 ${className} border-border`}>
      <div className="h-6 w-6 text-primary mx-auto">{icon}</div>
      <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest italic text-foreground">{title}</h3>
      <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{desc}</p>
    </div>
  );
}

function MetricBox({ value, label }: any) {
  return (
    <div className="p-4 md:p-6 border border-muted/20">
      <p className="text-2xl md:text-3xl font-black italic">{value}</p>
      <p className="text-[8px] md:text-[10px] uppercase font-bold text-muted/50">{label}</p>
    </div>
  );
}