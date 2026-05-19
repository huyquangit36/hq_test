"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { contactAction } from "@/app/actions/subscribe";

export function ContactForm() {
  const [isTransmitting, setIsTransmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsTransmitting(true);
    const result = await contactAction(formData);
    if (result.success) {
      toast.success(result.success);
      (document.getElementById("protocol-form") as HTMLFormElement).reset();
    } else {
      toast.error(result.error);
    }
    setIsTransmitting(false);
  }

  return (
    <div className="bg-[oklch(0.22_0.06_240)] p-6 sm:p-10 md:p-16 rounded-none text-white shadow-[8px_8px_0px_oklch(0.65_0.1_170)] md:shadow-[20px_20px_0px_oklch(0.65_0.1_170)] mr-2 md:mr-5 mb-5 md:mb-0">
      <form id="protocol-form" action={handleSubmit} className="space-y-8 md:space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-2 border-b border-zinc-800 focus-within:border-[oklch(0.65_0.1_170)]">
            <label className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Subject Name</label>
            <input name="name" type="text" required placeholder="IDENTIFY YOURSELF" className="w-full bg-transparent py-3 md:py-4 text-xs font-bold uppercase outline-none placeholder:text-zinc-800 transition-none" />
          </div>
          <div className="space-y-2 border-b border-zinc-800 focus-within:border-[oklch(0.65_0.1_170)]">
            <label className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Neural Path</label>
            <input name="email" type="email" required placeholder="EMAIL ADDRESS" className="w-full bg-transparent py-3 md:py-4 text-xs font-bold uppercase outline-none placeholder:text-zinc-800 transition-none" />
          </div>
        </div>
        <div className="space-y-2 border-b border-zinc-800 focus-within:border-[oklch(0.65_0.1_170)]">
          <label className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Inquiry Content</label>
          <textarea name="message" required rows={4} placeholder="DESCRIBE YOUR REQUEST..." className="w-full bg-transparent py-3 md:py-4 text-xs font-bold uppercase outline-none placeholder:text-zinc-800 resize-none transition-none" />
        </div>
        <button disabled={isTransmitting} type="submit" className="w-full md:w-auto px-10 md:px-16 py-5 md:py-7 bg-[oklch(0.65_0.1_170)] text-white text-[10px] font-black uppercase italic tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-white hover:text-black transition-none cursor-pointer rounded-none disabled:opacity-50">
          {isTransmitting ? "TRANSMITTING..." : "INITIALIZE LINK"}
          <Zap className={cn("h-4 w-4", isTransmitting && "animate-pulse")} />
        </button>
      </form>
    </div>
  );
}