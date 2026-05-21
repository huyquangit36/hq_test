import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { query } from "@/lib/db";

async function getNewsData() {
  const res = await query(`
    SELECT * FROM news 
    WHERE published_at <= NOW() 
    ORDER BY published_at DESC
  `);
  return res.rows;
}

export default async function NewsPage() {
  const articles = await getNewsData();

  return (
    <div className="min-h-screen bg-[#fafafa] text-[oklch(0.22_0.06_240)] font-sans selection:bg-[oklch(0.65_0.1_170)] selection:text-white">
      <Header />

      <main className="pt-24 md:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">

          {/* 01. EDITORIAL HEADER - GIỮ NGUYÊN LAYOUT */}
          <section className="mb-12 md:mb-20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-zinc-200 pb-12">
              <div className="border-l-8 border-[oklch(0.65_0.1_170)] pl-6 md:pl-8">
                <span className="text-[oklch(0.65_0.1_170)] text-[10px] font-black uppercase tracking-[0.5em] italic mb-4 block">
                  Archive Intelligence // Editorial
                </span>
                <h1 className="text-5xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8]">
                  THE<br />EDITORIAL.
                </h1>
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 w-full lg:w-auto">
                {["All", "Lookbook", "Drops", "Culture"].map((cat) => (
                  <button key={cat} className="whitespace-nowrap px-6 py-2 border border-zinc-200 text-[9px] font-black uppercase italic hover:bg-[oklch(0.22_0.06_240)] hover:text-white transition-none cursor-pointer rounded-none">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 02. ARTICLES GRID - DỮ LIỆU THẬT */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-zinc-200 border border-zinc-200 overflow-hidden">
            {articles.map((article, index) => (
              <Link
                href={`/news/${article.id}`} // Dẫn tới trang chi tiết
                key={article.id}
                className={cn(
                  "bg-white relative group cursor-crosshair overflow-hidden min-h-[400px] md:min-h-[500px]",
                  article.is_featured ? "md:col-span-12 lg:col-span-8" : "md:col-span-6 lg:col-span-4"
                )}
              >
                <Image
                  src={article.image_url || "/images/brand-story.png"}
                  alt={article.title}
                  fill
                  priority={index === 0}
                  className="object-cover grayscale transition-none duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-[oklch(0.22_0.06_240)]/80 opacity-0 group-hover:opacity-100 transition-none flex flex-col justify-between p-8 md:p-12 z-20">
                  <div className="flex justify-between items-start">
                    <span className="bg-[oklch(0.65_0.1_170)] text-white px-3 py-1 text-[9px] font-black italic tracking-widest">
                      {article.tag}
                    </span>
                    <ArrowUpRight className="text-[oklch(0.65_0.1_170)] h-8 w-8" />
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-[oklch(0.65_0.1_170)] uppercase tracking-[0.3em]">
                      {new Date(article.published_at).toLocaleDateString()} // Neural Post
                    </p>
                    <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-white max-w-md">
                      {article.title}
                    </h2>
                    <div className="pt-6 border-t border-zinc-800 w-fit">
                      <span className="text-[9px] font-black uppercase italic text-zinc-500 hover:text-white transition-none">
                        Read Archive Detail
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:hidden absolute bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-md border-t border-zinc-100 group-hover:hidden z-10">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[oklch(0.65_0.1_170)] text-[8px] font-black uppercase tracking-widest italic">{article.tag}</span>
                      <h3 className="text-lg font-black uppercase italic tracking-tighter leading-tight">{article.title}</h3>
                    </div>
                    <ArrowDownRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {articles.length === 0 && (
            <div className="py-40 text-center font-black italic text-zinc-300 uppercase">Archive is currently empty.</div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}