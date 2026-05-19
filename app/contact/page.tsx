import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Globe, MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact-form"; // Import component vừa tạo

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[oklch(0.22_0.06_240)] font-sans overflow-x-hidden">
      <Header />
      <main className="pt-24 md:pt-32 pb-12 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <section className="mb-12 md:mb-20 border-b border-zinc-200 pb-8 md:pb-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-8">
              <div className="border-l-4 md:border-l-8 border-[oklch(0.65_0.1_170)] pl-4 md:pl-8 w-full">
                <span className="text-[oklch(0.65_0.1_170)] text-[10px] font-black uppercase tracking-[0.5em] italic mb-2 md:mb-4 block animate-pulse">Neural Link // Status: Ready</span>
                <h1 className="text-[12vw] sm:text-6xl md:text-8xl lg:text-9xl font-black uppercase italic tracking-tighter leading-[0.85] break-words">CONTACT<br />PROTOCOL.</h1>
              </div>
              <p className="max-w-xs text-[10px] md:text-[11px] font-bold uppercase leading-relaxed text-zinc-400 italic">Initialize the communication link for archive inquiries. Response window: &lt; 24H.</p>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 lg:gap-20">
            {/* PHẦN FORM ĐÃ ĐƯỢC TÁCH RA ĐỂ TỐI ƯU */}
            <div className="order-1 lg:order-2 lg:col-span-7">
               <ContactForm />
            </div>

            {/* INFO CHANNELS - PHẦN NÀY LÀ TĨNH, LOAD CỰC NHANH TRÊN SERVER */}
            <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col gap-12 md:gap-16">
              <div className="space-y-10 md:space-y-12">
                <div className="group cursor-pointer">
                  <p className="text-[9px] font-black uppercase text-[oklch(0.65_0.1_170)] mb-2 tracking-[0.2em] italic">Primary Channel</p>
                  <p className="text-xs md:text-2xl font-black italic uppercase tracking-tighter break-all group-hover:text-[oklch(0.65_0.1_170)]">hqstreetwear.contact@gmail.com</p>
                </div>
                <div className="group cursor-pointer">
                  <p className="text-[9px] font-black uppercase text-[oklch(0.65_0.1_170)] mb-2 tracking-[0.2em] italic">Social Uplink</p>
                  <p className="text-xs md:text-2xl font-black italic uppercase tracking-tighter group-hover:text-[oklch(0.65_0.1_170)]">@hq_street_wear</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8 md:gap-10 pt-10 border-t border-zinc-100">
                <LocationNode city="Tokyo" address="Shibuya-Ku, 12-4 // JP" />
                <LocationNode city="London" address="Shoreditch High St // UK" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function LocationNode({ city, address }: { city: string, address: string }) {
  return (
    <div className="space-y-2 md:space-y-3">
      <h3 className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-zinc-500">
        <Globe className="h-3 w-3 text-[oklch(0.65_0.1_170)]" /> Node // {city}
      </h3>
      <p className="text-[10px] font-bold text-zinc-400 uppercase leading-loose italic">{address}</p>
    </div>
  );
}